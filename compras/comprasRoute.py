from config import db
from flask import request, jsonify, session, Blueprint
import requests
import datetime
from comprasModel import Pedido, Endereco, ItensPedido, Livro 

compra_bp = Blueprint('compra', __name__)
## ROTA APENAS DE TESTE E PARA ENTENDER COMO FUNCIONA A CRIAÇÃO DE PEDIDO

@compra_bp.route("/pedidos", methods=["POST"])
def cria_pedido():
    # 1. VERIFICAÇÃO DE LOGIN E OBTENÇÃO DO ID DO CLIENTE
    if 'id_cliente' not in session:
        # Se o id_cliente não estiver na sessão, o usuário não está logado
        return jsonify({"message": "Usuário não autenticado. Faça login para continuar."}), 401
    
    id_cliente = session['id_cliente']
    data = request.get_json()
    
    endereco_data = data.get('endereco')
    itens_data = data.get('itens')
    
    if not endereco_data or not itens_data:
        return jsonify({"message": "Dados de endereço ou itens de compra ausentes."}), 400

    try:
        # INICIA A TRANSAÇÃO: Garante que ou TUDO é salvo, ou NADA é salvo.
        db.session.begin_nested() 

        # --- A. PROCESSAMENTO E SALVAMENTO DO ENDEREÇO (VIA CEP) ---
        cep = endereco_data.get('cep', '').replace('-', '').replace('.', '')
        if len(cep) != 8:
            db.session.rollback()
            return jsonify({"message": "CEP inválido. Deve ter 8 dígitos."}), 400
            
        # Consulta ViaCEP (Garantindo que os dados sejam oficiais e corretos)
        viacep_response = requests.get(f"https://viacep.com.br/ws/{cep}/json/")
        viacep_data = viacep_response.json()

        if viacep_data.get('erro'):
            db.session.rollback()
            return jsonify({"message": "CEP não encontrado pelo ViaCEP. Por favor, verifique o número."}), 400

        # Cria e Salva o Endereço (Associado ao id_cliente)
        novo_endereco = Endereco(
            id_cliente=id_cliente, # <--- USANDO O ID DO CLIENTE DA SESSÃO
            cep=cep,
            rua=viacep_data.get('logradouro'),
            bairro=viacep_data.get('bairro'),
            cidade=viacep_data.get('localidade'),
            estado=viacep_data.get('uf'),
            numero=endereco_data.get('numero'),
            complemento=endereco_data.get('complemento', '')
        )
        db.session.add(novo_endereco)
        # O flush() é crucial para obter o ID antes de criar o Pedido
        db.session.flush() 
        id_endereco_entrega = novo_endereco.id

        # --- B. PROCESSAMENTO DOS ITENS, VALIDAÇÃO DE ESTOQUE E CÁLCULO ---
        valor_total = 0
        itens_para_pedido = []

        for item in itens_data:
            livro = db.session.get(Livro, item['id_livro'])
            quantidade = item['quantidade']

            if not livro:
                db.session.rollback()
                return jsonify({"message": f"Livro ID {item['id_livro']} não encontrado."}), 404

            if livro.estoque < quantidade:
                db.session.rollback()
                return jsonify({"message": f"Estoque insuficiente para o livro '{livro.titulo}'. Disponível: {livro.estoque}"}), 400

            # Cálculo e Atualização de Estoque
            preco_unitario_pago = livro.preco 
            valor_total += preco_unitario_pago * quantidade
            
            itens_para_pedido.append({
                'id_livro': livro.id, 
                'quantidade': quantidade, 
                'preco_unitario_pago': preco_unitario_pago
            })

        # --- C. CRIAÇÃO DO PEDIDO (Associado aos IDs) ---
        novo_pedido = Pedido(
            id_cliente=id_cliente, # <--- USANDO O ID DO CLIENTE DA SESSÃO
            id_endereco_entrega=id_endereco_entrega, # <--- USANDO O ID DO ENDEREÇO RECÉM-CRIADO
            data_pedido=datetime.date.today(),
            status="Pendente", 
            valor_total=valor_total
        )
        db.session.add(novo_pedido)
        db.session.flush() 
        id_pedido = novo_pedido.id_pedido

        # --- D. CRIAÇÃO DOS ITENS DO PEDIDO ---
        for item in itens_para_pedido:
            novo_item = ItensPedido(
                id_pedido=id_pedido,
                id_livro=item['id_livro'],
                quantidade=item['quantidade'],
                preco_unit=item['preco_unitario_pago']
            )
            db.session.add(novo_item)
            
        # --- E. COMMIT (FINALIZA A TRANSAÇÃO) ---
        db.session.commit()
        
        return jsonify({
            "message": "Pedido criado com sucesso!",
            "id_pedido": id_pedido,
            "valor_total": round(valor_total, 2)
        }), 201

    except Exception as e:
        # Em caso de qualquer erro (exceção), desfaz todas as alterações
        db.session.rollback()
        print(f"Erro ao processar pedido: {e}")
        return jsonify({"message": "Erro interno ao finalizar o pedido. Tente novamente mais tarde."}), 500