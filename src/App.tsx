import { useState, useEffect } from "react";
import { supabase } from './supabaseClient';

type Todo = {
  id: number;
  text: string;
  description: string;
  completed: boolean;
  time: string;
};

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [description, setDescription] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const fetchTodos = async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('id', { ascending: false });

      if (error) console.error("Fetch error:", error.message);
      else setTodos(data as Todo[]);
    };

    fetchTodos();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setStopwatchTime(prev => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatStopwatch = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const addTodo = async () => {
    if (input.trim() !== '') {
      const time = new Date().toLocaleString();
      const { data, error } = await supabase
        .from('todos')
        .insert([{ text: input.trim(), description: description.trim(), completed: false, time }])
        .select();

      if (error) console.error("Insert error:", error.message);
      else {
        setTodos([...(data as Todo[]), ...todos]);
        setInput('');
        setDescription('');
      }
    }
  };

  const toggleComplete = async (index: number) => {
    const todo = todos[index];
    const { data, error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', todo.id)
      .select();

    if (error) console.error("Update error:", error.message);
    else {
      const updatedTodos = [...todos];
      updatedTodos[index] = (data as Todo[])[0];
      setTodos(updatedTodos);
    }
  };

  const removeTodo = async (index: number) => {
    const todo = todos[index];
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todo.id);

    if (error) console.error("Delete error:", error.message);
    else {
      const updatedTodos = todos.filter((_, i) => i !== index);
      setTodos(updatedTodos);
    }
  };

  return (
    <div className={`min-h-screen p-4 ${darkMode ? 'bg-slate-900 text-white' : 'bg-blue-100 text-black'}`}>
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">To-Do App</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="border px-3 py-1 rounded backdrop-blur-sm bg-white/10 dark:bg-white/10 border-gray-300 dark:border-gray-600 hover:bg-white/20 dark:hover:bg-white/20"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto mb-6">
        {/* Current Time */}
        <div className={`p-6 rounded-lg shadow-lg ${darkMode ? 'bg-gradient-to-br from-slate-700 to-slate-600' : 'bg-gradient-to-br from-white to-blue-200'}`}>
          <h2 className="text-2xl font-semibold mb-2 text-center">🕒 Current Time</h2>
          <p className="text-4xl font-mono text-center">{currentTime.toLocaleTimeString()}</p>
        </div>

        {/* Add Todo */}
        <div className={`p-6 rounded-lg shadow-lg ${darkMode ? 'bg-gradient-to-br from-slate-700 to-slate-600' : 'bg-gradient-to-br from-white to-blue-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Details..</h1>
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter task title"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-200 text-black"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-200 text-black resize-none"
              rows={2}
            />
            <button
              onClick={addTodo}
              className={`px-4 py-2 rounded backdrop-blur-sm hover:opacity-90 w-fit 
                ${darkMode
                  ? 'bg-purple-700 text-white hover:bg-purple-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
              Add Task
            </button>
          </div>
        </div>

        {/* Stopwatch */}
        <div className={`p-6 rounded-lg shadow-lg ${darkMode ? 'bg-gradient-to-br from-slate-700 to-slate-600' : 'bg-gradient-to-br from-white to-blue-200'}`}>
          <h2 className="text-2xl font-semibold mb-2 text-center">⏱️ Stopwatch</h2>
          <p className="text-4xl font-mono mb-3 text-center">{formatStopwatch(stopwatchTime)}</p>
          <div className="flex gap-2 flex-wrap items-center justify-center">
            <button onClick={() => setIsRunning(true)} className="px-3 py-1 rounded text-white bg-green-500 hover:bg-green-600 backdrop-blur-sm bg-opacity-80">Start</button>
            <button onClick={() => setIsRunning(false)} className="px-3 py-1 rounded text-white bg-yellow-500 hover:bg-yellow-600 backdrop-blur-sm bg-opacity-80">Pause</button>
            <button onClick={() => { setIsRunning(false); setStopwatchTime(0); }} className="px-3 py-1 rounded text-white bg-red-500 hover:bg-red-600 backdrop-blur-sm bg-opacity-80">Reset</button>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="w-full max-w-3xl mx-auto space-y-4">
        {todos.length === 0 ? (
          <p className="text-center text-gray-500">No tasks yet</p>
        ) : (
          todos.map((todo, index) => (
            <div
              key={todo.id}
              className={`p-4 rounded-lg shadow-md border flex flex-col gap-1 ${darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-300'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3
                    onClick={() => toggleComplete(index)}
                    className={`font-semibold text-lg cursor-pointer ${todo.completed ? 'line-through text-gray-400' : ''}`}
                  >
                    {todo.text}
                  </h3>
                  {todo.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">{todo.description}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Assigned: {todo.time}</p>
                </div>
                <button
                  onClick={() => removeTodo(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
