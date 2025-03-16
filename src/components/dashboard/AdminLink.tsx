
import React from "react";
import { Link } from "react-router-dom";
import { LockIcon } from "lucide-react";

const AdminLink: React.FC = () => {
  return (
    <Link 
      to="/admin" 
      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
    >
      <LockIcon size={12} />
      <span>Admin</span>
    </Link>
  );
};

export default AdminLink;
