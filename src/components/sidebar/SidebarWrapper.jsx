import { freelancerMenu } from "./freelancerMenu";
import { customerMenu } from "./customerMenu";

export default function SidebarWrapper({ role }) {
  const navItems = role === "freelancer" ? freelancerMenu : customerMenu;
  return <Sidebar navItems={navItems} />;
}
