from pymongo import MongoClient
client = MongoClient('connection_string')
db = client['db_name']

