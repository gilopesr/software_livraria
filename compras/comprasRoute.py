import requests
from config import db
from flask import request, jsonify, session, Blueprint, render_template, redirect, url_for,flash
import datetime
from compras.comprasModel import Pedido, Endereco, ItensPedido
from livro.livroModel import Livro

compra_bp = Blueprint('compra', __name__)



@compra_bp.route('/compras')
def carrinhoCompras():
    if not session.get('logged_in'):
        return redirect(url_for('auth_bp.login'))

    return render_template('compras.html')


@compra_bp.route('/finalizar-pedido', methods=['POST'])
def finalizar_pedido():
    id_cliente = session.get('id_cliente') 
    
    if not id_cliente:
         return jsonify({"success": False, "message": "Cliente não autenticado. Faça login para continuar."}), 401

    try:
        data = request.get_json()
        endereco_data = data.get('endereco')
        itens_carrinho = data.get('carrinho', [])
        valor_total_pedido = data.get('valor_total', 0.0)
        
        if not endereco_data or not itens_carrinho or valor_total_pedido <= 0:
            return jsonify({"success": False, "message": "Dados do pedido incompletos ou valor total inválido."}), 400

        novo_endereco = Endereco(
            id_cliente=id_cliente,
            cep=endereco_data.get('cep'),
            rua=endereco_data.get('logradouro'),
            numero=endereco_data.get('numero'),
            complemento=endereco_data.get('complemento', ''),
            bairro=endereco_data.get('bairro'),
            cidade=endereco_data.get('cidade'),
            estado=endereco_data.get('uf')
        )
        db.session.add(novo_endereco)
        db.session.flush() 

        novo_pedido = Pedido(
            id_cliente=id_cliente,
            id_endereco_entrega=novo_endereco.id, 
            valor_total=valor_total_pedido,
            status='pedido realizado'
        )
        db.session.add(novo_pedido)
        db.session.flush() 

        for item in itens_carrinho:
            isbn_recebido = item['id_livro'] 
            quantidade_int = int(item['quantidade'])
            preco_unit_float = float(item['preco_unitario'])
            
            livro = db.session.execute(
                db.select(Livro).filter_by(isbn=isbn_recebido)
            ).scalar_one_or_none()
            
            if not livro:
                db.session.rollback()
                return jsonify({
                    "success": False, 
                    "message": f"Livro com ISBN {isbn_recebido} não encontrado no estoque."
                }), 404
            
            id_livro_fk = livro.id

            novo_item = ItensPedido(
                id_pedido=novo_pedido.id_pedido,
                id_livro=id_livro_fk,
                quantidade=quantidade_int,
                preco_unit=preco_unit_float
            )
            db.session.add(novo_item)

        db.session.commit()

        return jsonify({"success": True, "message": "Pedido finalizado com sucesso!", "id_pedido": novo_pedido.id_pedido}), 200

    except Exception as e:
        db.session.rollback()
        print("-" * 50)
        print("ERRO CRÍTICO NO CHECKOUT:")
        print(f"Detalhes do erro: {e}")
        print("-" * 50)
        return jsonify({"success": False, "message": "Erro interno ao processar o pedido. Tente novamente."}), 500