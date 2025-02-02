from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class TodoApp:
    def __init__(self):
        self.todos = []
        self.filename = "todos.json"
        self.load_todos()

    def load_todos(self):
        if os.path.exists(self.filename):
            try:
                with open(self.filename, 'r') as f:
                    self.todos = json.load(f)
            except json.JSONDecodeError:
                self.todos = []
        else:
            self.todos = []

    def save_todos(self):
        with open(self.filename, 'w') as f:
            json.dump(self.todos, f, indent=2)

    def get_todos(self):
        return self.todos

    def add_todo(self, title, description=""):
        todo = {
            "id": len(self.todos) + 1,
            "title": title,
            "description": description,
            "completed": False,
            "created_at": datetime.now().isoformat(),
            "completed_at": None
        }
        self.todos.append(todo)
        self.save_todos()
        return todo

    def complete_todo(self, todo_id):
        for todo in self.todos:
            if todo["id"] == todo_id:
                todo["completed"] = not todo["completed"]  # Toggle completion
                todo["completed_at"] = datetime.now().isoformat() if todo["completed"] else None
                self.save_todos()
                return todo
        return None

    def delete_todo(self, todo_id):
        initial_length = len(self.todos)
        self.todos = [todo for todo in self.todos if todo["id"] != todo_id]
        if len(self.todos) < initial_length:
            self.save_todos()
            return True
        return False

# Create a global instance of TodoApp
todo_app = TodoApp()

@app.route('/api/todos', methods=['GET'])
def get_todos():
    return jsonify(todo_app.get_todos())

@app.route('/api/todos', methods=['POST'])
def add_todo():
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({"error": "Title is required"}), 400
    
    title = data['title']
    description = data.get('description', '')
    todo = todo_app.add_todo(title, description)
    return jsonify(todo), 201

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def toggle_todo(todo_id):
    todo = todo_app.complete_todo(todo_id)
    if todo:
        return jsonify(todo)
    return jsonify({"error": "Todo not found"}), 404

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    if todo_app.delete_todo(todo_id):
        return '', 204
    return jsonify({"error": "Todo not found"}), 404

if __name__ == "__main__":
    app.run(debug=True, port=5000)