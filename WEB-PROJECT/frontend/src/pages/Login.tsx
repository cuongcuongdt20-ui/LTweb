import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/signin", formData);
      const token = response.data.token;
      const user = response.data.user;

      localStorage.setItem("token", token);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        if (user.id != null) {
          localStorage.setItem("userId", String(user.id));
        }
      }

      navigate("/");
    } catch (err: any) {
      if (typeof err.response?.data === "string") {
        setError(err.response.data);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Khong the ket noi den may chu. Vui long thu lai.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Dang Nhap
        </h2>

        {error && (
          <div className="text-red-500 text-sm mb-4 text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div className="flex justify-end">
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Quen mat khau?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 text-white font-semibold rounded transition duration-200 mt-4 ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isLoading ? "Dang xu ly..." : "Dang Nhap"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm border-t border-gray-200 pt-6">
          Chua co tai khoan?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-medium hover:underline"
          >
            Dang ky
          </Link>
        </p>
      </div>
    </div>
  );
}
