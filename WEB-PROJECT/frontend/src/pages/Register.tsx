import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    avatarUrl: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await api.post("/api/auth/signup", formData);
      setIsError(false);
      setMessage(
        typeof response.data === "string"
          ? response.data
          : "Dang ky thanh cong! Ban co the dang nhap ngay.",
      );
    } catch (error: any) {
      setIsError(true);
      if (typeof error.response?.data === "string") {
        setMessage(error.response.data);
      } else {
        setMessage(error.response?.data?.error || "Co loi xay ra khi dang ky");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Tao Tai Khoan
        </h2>

        {message && (
          <div
            className={`p-3 rounded mb-4 text-sm text-center border ${isError ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-600 border-green-200"}`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-600 mb-1 text-sm">Ho va Ten</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhap ten cua ban"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1 text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@gmail.com"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1 text-sm">Mat khau</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1 text-sm">
              Avatar URL (tu? chon)
            </label>
            <input
              type="url"
              name="avatarUrl"
              value={formData.avatarUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/avatar.png"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition duration-200 mt-4"
          >
            Dang Ky
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm border-t border-gray-200 pt-6">
          Da co tai khoan?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Dang nhap
          </Link>
        </p>
      </div>
    </div>
  );
}
