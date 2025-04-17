import {
  Sun,
  Moon,
  Box,
  Menu,
  LogOut,
  X,
  LayoutDashboard,
  Package,
  Tag,
  Users,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Bell,
  Inbox,
  Check,
  Info,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2
} from 'lucide-angular';

export const LUCIDE_ICONS = {
  Sun,
  Moon,
  Box,
  Menu,
  LogOut,
  X,
  LayoutDashboard,
  Package,
  Tag,
  Users,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Bell,
  Inbox,
  Check,
  Info,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2
};

export function getIconName(iconKey: keyof typeof LUCIDE_ICONS): string {
  return iconKey
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}
