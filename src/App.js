import React, { useEffect, useState } from "react";
import API from "./api";
import Login from "./Login";
import Signup from "./Signup";
import { FaBox, FaChartBar, FaUser, FaUpload } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import Papa from "papaparse";

function App() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [category, setCategory] = useState("");

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isSignup, setIsSignup] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  // CSV states
  const [csvData, setCsvData] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (token) fetchItems();
  }, [token]);

  const fetchItems = async () => {
    try {
      const res = await API.get("/items");
      setItems(res.data);

      const unique = [...new Set(res.data.map(i => i.category).filter(Boolean))];
      setCategories(unique);
    } catch (err) {
      console.log(err);
    }
  };

  const addItem = async () => {
    if (!name || !qty || !category) return alert("Fill all fields");

    await API.post("/items", { name, quantity: qty, category });

    setName("");
    setQty("");
    setCategory("");
    fetchItems();
  };

  // ================= CSV HANDLING =================

  const handleFile = (file) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const cleaned = results.data.filter(r => r.name && r.quantity);

        // Duplicate detection
        const unique = cleaned.filter(
          (v, i, a) =>
            a.findIndex(t => t.name === v.name && t.category === v.category) === i
        );

        setCsvData(unique);
      },
    });
  };

  const uploadCSV = async () => {
    try {
      let count = 0;

      for (let row of csvData) {
        await API.post("/items", {
          name: row.name,
          quantity: row.quantity,
          category: row.category,
        });

        count++;
        setUploadProgress(Math.round((count / csvData.length) * 100));
      }

      alert("Upload Complete ✅");
      setCsvData([]);
      setUploadProgress(0);
      fetchItems();

    } catch (err) {
      console.log(err);
      alert("Upload failed ❌");
    }
  };

  // Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  if (!token) {
    return isSignup ? (
      <Signup setToken={setToken} switchToLogin={() => setIsSignup(false)} />
    ) : (
      <Login setToken={setToken} switchToSignup={() => setIsSignup(true)} />
    );
  }

  const chartData = {
    labels: items.map(i => i.name),
    datasets: [
      {
        label: "Stock",
        data: items.map(i => i.quantity),
        backgroundColor: "rgba(59,130,246,0.6)"
      }
    ]
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-5">
        <h2 className="text-2xl mb-6">Inventory</h2>

        <div onClick={() => setActivePage("dashboard")} className="flex gap-2 cursor-pointer mb-3">
          <FaChartBar /> Dashboard
        </div>

        <div onClick={() => setActivePage("items")} className="flex gap-2 cursor-pointer mb-3">
          <FaBox /> Items
        </div>

        <div onClick={() => setActivePage("profile")} className="flex gap-2 cursor-pointer">
          <FaUser /> Profile
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            setToken(null);
          }}
          className="mt-6 bg-red-500 px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 p-6">

        {/* DASHBOARD */}
        {activePage === "dashboard" && (
          <>
            <h1 className="text-2xl mb-4">Dashboard</h1>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded shadow">
                <h3>Total Items</h3>
                <p className="text-2xl">{items.length}</p>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h3>Categories</h3>
                <p className="text-2xl">{categories.length}</p>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h3>Total Stock</h3>
                <p className="text-2xl">
                  {items.reduce((a, b) => a + b.quantity, 0)}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded shadow">
              <Bar data={chartData} />
            </div>
          </>
        )}

        {/* ITEMS */}
        {activePage === "items" && (
          <>
            <h1 className="text-2xl mb-4">Items</h1>

            {/* Drag & Drop */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed p-6 text-center mb-4 bg-white rounded"
            >
              <FaUpload className="mx-auto mb-2" />
              Drag & Drop CSV here
            </div>

            {/* File Upload */}
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFile(e.target.files[0])}
              className="mb-4"
            />

            {/* Preview */}
            {csvData.length > 0 && (
              <div className="bg-white p-4 mb-4 rounded shadow">
                <h3 className="font-bold mb-2">Preview</h3>

                {csvData.map((row, i) => (
                  <div key={i}>
                    {row.name} - {row.quantity} - {row.category}
                  </div>
                ))}

                <button
                  onClick={uploadCSV}
                  className="bg-green-500 text-white px-4 mt-3"
                >
                  Upload All
                </button>
              </div>
            )}

            {/* Progress Bar */}
            {uploadProgress > 0 && (
              <div className="bg-gray-300 h-4 rounded mb-4">
                <div
                  className="bg-green-500 h-4 rounded"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            {/* Add Item manually */}
            <div className="flex gap-2 mb-6">
              <input placeholder="Name" onChange={(e) => setName(e.target.value)} className="border p-2" />
              <input placeholder="Qty" onChange={(e) => setQty(e.target.value)} className="border p-2" />
              <input placeholder="Category" onChange={(e) => setCategory(e.target.value)} className="border p-2" />

              <button onClick={addItem} className="bg-blue-500 text-white px-4">
                Add
              </button>
            </div>

            {/* Items */}
            {categories.map((cat, i) => (
              <div key={i}>
                <h2 className="font-bold">{cat}</h2>

                {items.filter(i => i.category === cat).map(item => (
                  <div key={item.id} className="bg-white p-3 rounded shadow mb-2">
                    {item.name} ({item.quantity})
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* PROFILE */}
        {activePage === "profile" && (
          <>
            <h1>User Profile</h1>
          </>
        )}

      </div>
    </div>
  );
}

export default App;