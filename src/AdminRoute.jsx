import { Navigate } from "react-router-dom";

const ADMIN_EMAILS = [
  "sudharshanr2510@gmail.com",
  "contact.radsonline@gmail.com",
  "r983230@gmail.com",
];

export default function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.email;

  if (ADMIN_EMAILS.includes(email)) {
    return children;
  }

  return <Navigate to="/customer" />;
}
