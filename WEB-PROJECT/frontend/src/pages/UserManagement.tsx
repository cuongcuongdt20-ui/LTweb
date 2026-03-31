export default function UserManagement() {
  return (
    <div className="flex flex-col h-full bg-white p-8">
      <h1 className="text-2xl font-bold text-gray-900">Quan ly thanh vien</h1>
      <p className="text-sm text-gray-500 mt-1">
        Backend hien tai khong co endpoint `/api/users`, vi vay man nay da duoc dua ve trang thai chi thong bao.
      </p>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <p className="font-semibold">Khong co API phu hop trong backend README.</p>
        <p className="mt-2 text-sm leading-6">
          Neu can quan ly nguoi dung, can bo sung endpoint tu backend truoc. Hien tai frontend khong con goi
          cac route `/api/users` va `/api/users/:id` de tranh loi 404.
        </p>
      </div>
    </div>
  );
}
