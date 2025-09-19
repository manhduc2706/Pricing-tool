interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-5">
      {/* Thêm padding tổng thể */}
      <nav className="bg-white">
        {" "}
        {/* Thêm bóng để nổi bật */}
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          {" "}
          {/* Tăng chiều rộng */}
          <div className="flex flex-col justify-center items-center h-15">
            {" "}
            {/* Tăng chiều cao */}
            <div className="text-2xl font-semibold text-[#0F4FAF] tracking-wide">
              {" "}
              {/* Chữ to hơn */}
              HỆ THỐNG BÁO GIÁ C-CCAM
            </div>
            <div className="text-sm font-medium text-gray-500 mt-1">
              {" "}
              {/* Chữ mô tả to hơn và cách dòng */}
              Tạo báo giá nhanh chóng cho dịch vụ hệ thống C-CAM
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-screen-xl mx-auto px-6 lg:px-12">
        {" "}
        {/* Tăng padding và chiều rộng */}
        {children}
      </main>
    </div>
  );
}
