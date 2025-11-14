from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from config import db
from cliente.clienteModel import Cliente
from werkzeug.security import check_password_hash

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        cliente = Cliente.query.filter_by(username=username).first()

        # 2. Verifica se o cliente existe E se a senha fornecida corresponde ao hash armazenado
        if cliente and check_password_hash(cliente.senha, password):
            
            session['id_cliente'] = cliente.id
            session['nome_cliente'] = cliente.username

            flash(f"Bem-vindo, {cliente.username}!", "sucesso")
            return redirect(url_for("livro.index"))
        else:
            flash("Usuário ou senha incorretos!", "erro")
            return redirect(url_for("auth_bp.login"))
    
    return render_template("login.html")


# Logout deve ficar fora da função login
@auth_bp.route("/logout")
def logout():
    session.pop('nome_cliente', None)
    flash("Você saiu da sua conta.", "sucesso")
    return redirect(url_for("auth_bp.login"))


@auth_bp.route('/status_login', methods=['GET'])
def status_login():
    """
    Retorna o status de autenticação do usuário.
    Usa 'nome_cliente' na sessão como indicador de login.
    """
    if 'nome_cliente' in session:
        return jsonify({
            'logged_in': True,
            'username': session['nome_cliente'],
            'id_cliente': session['id_cliente']
        }), 200
    else:
        return jsonify({
            'logged_in': False
        }), 200