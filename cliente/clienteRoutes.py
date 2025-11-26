from werkzeug.security import generate_password_hash, check_password_hash
from flask import Blueprint, render_template, request, redirect, url_for, flash,session
from .clienteModel import Cliente
from config import db
from sqlalchemy.exc import IntegrityError
import os

cliente_bp = Blueprint("cliente_bp", __name__)

hash_admin='pbkdf2:sha256:6000000$pZdtIpYfkJxKyAeX$8898d92e3c84dbce3fb4f1def449f0c4dd0d088f76033d3dc8efa2c897b1f8d4'
admin_passw = os.environ.get('admin_passw',hash_admin)

@cliente_bp.route('/login',methods=['GET','POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        senha = request.form.get('password')
        if username == 'admin' and check_password_hash(admin_passw, senha):
            session['logged_in'] = True
            session['username'] = username
            session['is_admin'] = True

            flash('Login de administrador realizado com sucesso!!✅')
            return redirect(url_for('home'))
        else:
            flash("❌Usuário ou senha inválidos!!❌")
            return render_template('login.html')
    return render_template('login.html')

@cliente_bp.route("/cadastroClientes")
def cadastro():
    return render_template("cadastroClientes.html")

@cliente_bp.route("/clientes/novo", methods=["GET"])
def formulario_cliente():
    return render_template("cadastroClientes.html")

@cliente_bp.route("/clientes", methods=["GET", "POST"])
def salvar_cliente():
    if request.method == "POST":
        try:
            nome = request.form.get("nome")
            email = request.form.get("email")
            telefone = request.form.get("telefone")
            senha = request.form.get("senha")
            confirmar_senha = request.form.get("confirmar_senha")
            data_nasc = request.form.get("data_nasc")
            username = request.form.get("username")

            # Validações
            if not nome or not email or not senha:
                flash("Nome, Email e Senha são obrigatórios!", "erro")
                return redirect(url_for("cliente_bp.salvar_cliente"))

            if senha != confirmar_senha:
                flash("A senha e a confirmação não são iguais!", "erro")
                return redirect(url_for("cliente_bp.salvar_cliente"))
            
            hashed_password = generate_password_hash(senha, method='pbkdf2:sha256')

            if not username:
                flash("Username é obrigatório!", "erro")
                return redirect(url_for("cliente_bp.salvar_cliente"))

            # Verificar se o email já existe
            cliente_existente = Cliente.query.filter_by(email=email).first()
            if cliente_existente:
                flash("Este email já está cadastrado!", "erro")
                return redirect(url_for("cliente_bp.salvar_cliente"))
            

            novo_cliente = Cliente(
                nome=nome,
                email=email,
                telefone=telefone,
                senha=hashed_password,
                data_nasc=data_nasc if data_nasc else None,
                username=username,
            )

            db.session.add(novo_cliente)
            db.session.commit()

            flash("Cliente cadastrado com sucesso!", "sucesso")
            return redirect(url_for("cliente_bp.login"))

        except IntegrityError:
            db.session.rollback()
            flash("Erro no banco de dados!", "erro")
            return redirect(url_for("cliente_bp.salvar_cliente"))

    return render_template("cadastroClientes.html")

@cliente_bp.route("/clientes/check_email", methods=["POST"])
def check_email():
    email = request.json.get("email")

    if not email:
        return {"available": False, "message": "Email não fornecido."}, 400

    cliente_existente = Cliente.query.filter_by(email=email).first()

    if cliente_existente:
        return {"available": False, "message": "Este email já está cadastrado!"}

    return {"available": True}, 200

    

from flask import session

@cliente_bp.route("/logout")
def logout():
    session.pop('logged_in', None)
    session.pop('username', None)
    session.pop('is_admin', None)
    session.clear()
    return render_template("logout.html", mensagem="Você saiu da conta! Obrigado por visitar nossa livraria :)")

