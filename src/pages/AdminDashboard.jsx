import AdminAccounts from '../features/routines/AdminAccounts';
import { Workspace } from '../features/routines/Workspace';

export default function AdminDashboard() {
  return <Workspace admin><AdminAccounts /></Workspace>;
}
