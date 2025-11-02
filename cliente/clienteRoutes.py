from flask import Blueprint, render_template, request, redirect, url_for, flash
from .clienteModel import Cliente
from config import db
from sqlalchemy.exc import IntegrityError

cliente_bp = Blueprint("cliente_bp", __name__)

@cliente_bp.route("/cadastroClientes")
def cadastro():
    return render_template("cadastro.html")

@cliente_bp.route("/clientes/novo")
def formulario_cliente():
    return render_template("cadastroClientes.html")

@cliente_bp.route("/clientes", methods=["POST"])
def salvar_cliente():
    try:
        nome = request.form.get("nome")
        email = request.form.get("email")
        telefone = request.form.get("telefone")
        endereco = request.form.get("endereco")
        senha = request.form.get("senha")
        confirmar_senha = request.form.get("confirmar_senha")
        data_nasc = request.form.get("data_nasc")  # Melhor usar get() para evitar KeyError
        username = request.form.get("username")

        # ✅ 1. Validações básicas
        if not nome or not email or not senha:
            flash("⚠ Nome, Email e Senha são obrigatórios!", "erro")
            return redirect(url_for("cliente_bp.formulario_cliente"))

        if senha != confirmar_senha:
            flash("⚠ A senha e a confirmação não são iguais!", "erro")
            return redirect(url_for("cliente_bp.formulario_cliente"))

        if not username:
            flash("⚠ Username é obrigatório!", "erro")
            return redirect(url_for("cliente_bp.formulario_cliente"))

        # ✅ 2. Verificar se o email já existe (ANTES de tentar salvar)
        cliente_existente = Cliente.query.filter_by(email=email).first()
        if cliente_existente:
            flash("⚠ Este email já está cadastrado!", "erro")
            return redirect(url_for("cliente_bp.formulario_cliente"))

        username = request.form.get('username')
        if not username:
            flash("⚠ Username é obrigatório!", "erro")
            return redirect(url_for("cliente_bp.formulario_cliente"))

        novo_cliente = Cliente(
            nome=nome,
            email=email,
            telefone=telefone,
            endereco=endereco,
            senha=senha,
            data_nasc=data_nasc if data_nasc else None,
            username=username,
        )

        db.session.add(novo_cliente)
        db.session.commit()

        flash("✅ Cliente cadastrado com sucesso!", "sucesso")
        return redirect(url_for("livro.login"))

    except IntegrityError:
        db.session.rollback()
        flash("⚠ Erro no banco de dados ou email duplicado!", "erro")
        return redirect(url_for("cliente_bp.formulario_cliente"))
