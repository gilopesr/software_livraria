import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)

app.config['HOST'] = '0.0.0.0'
app.config['PORT']=5000
app.config['DEBUG'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://root:27052005@db/livraria"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
