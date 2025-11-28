import { useState } from "react";
import TopNavbar from "./TopNavbar";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <TopNavbar onMenuToggle={() => setOpen(!open)} />

      <Sidebar isOpen={open} onClose={() => setOpen(false)} />

    
        {/* MAIN CONTENT */}
        <main
          className="
            flex-1 p-4 
            mt-14
            md:ml-64  
          "
        >
          {children}
        </main>
    </div>
  );
};

export default DashboardLayout;
