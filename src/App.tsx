import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, CheckCircle, Circle, ClipboardList } from 'lucide-react';

interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  completed_at: string | null;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = () => {
    try {
      const savedTodos = localStorage.getItem('todos');
      setTodos(savedTodos ? JSON.parse(savedTodos) : []);
      setError(null);
    } catch (error) {
      console.error('Error loading todos:', error);
      setError('Failed to load todos. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTodos = (newTodos: Todo[]) => {
    try {
      localStorage.setItem('todos', JSON.stringify(newTodos));
    } catch (error) {
      console.error('Error saving todos:', error);
      setError('Failed to save todos. Please try again.');
    }
  };

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const newTodo: Todo = {
        id: Date.now(),
        title: newTitle,
        description: newDescription,
        completed: false,
        created_at: new Date().toISOString(),
        completed_at: null
      };

      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      saveTodos(updatedTodos);
      setNewTitle('');
      setNewDescription('');
      setError(null);
    } catch (error) {
      console.error('Error adding todo:', error);
      setError('Failed to add todo. Please try again.');
    }
  };

  const toggleTodo = (id: number) => {
    try {
      const updatedTodos = todos.map(todo => {
        if (todo.id === id) {
          return {
            ...todo,
            completed: !todo.completed,
            completed_at: !todo.completed ? new Date().toISOString() : null
          };
        }
        return todo;
      });
      setTodos(updatedTodos);
      saveTodos(updatedTodos);
      setError(null);
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Failed to update todo. Please try again.');
    }
  };

  const deleteTodo = (id: number) => {
    try {
      const updatedTodos = todos.filter(todo => todo.id !== id);
      setTodos(updatedTodos);
      saveTodos(updatedTodos);
      setError(null);
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Failed to delete todo. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 bg-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClipboardList className="h-8 w-8 text-white" />
                <h1 className="text-2xl font-bold text-white">Todo App</h1>
              </div>
              <div className="text-white text-sm">
                {todos.filter(t => t.completed).length}/{todos.length} completed
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={addTodo} className="p-6 border-b">
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="What needs to be done?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                placeholder="Add a description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add Todo
              </button>
            </div>
          </form>

          <div className="divide-y divide-gray-200">
            {todos.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No todos yet. Add one above!
              </div>
            ) : (
              todos.map(todo => (
                <div
                  key={todo.id}
                  className={`p-6 flex items-start space-x-4 ${
                    todo.completed ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="mt-1 focus:outline-none"
                  >
                    {todo.completed ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h3 className={`text-lg font-medium ${
                      todo.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}>
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p className={`mt-1 text-sm ${
                        todo.completed ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {todo.description}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      Created: {new Date(todo.created_at).toLocaleString()}
                      {todo.completed_at && (
                        <span className="ml-4">
                          Completed: {new Date(todo.completed_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-gray-400 hover:text-red-500 focus:outline-none"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;