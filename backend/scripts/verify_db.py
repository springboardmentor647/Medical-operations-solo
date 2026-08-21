import sqlite3
conn = sqlite3.connect(r"D:\INTERNSHIP\7TH SEM\INFOSYS SPRINGBOARD\APP\data\hospital_blueprint.db")
print(conn.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall())
conn.close()