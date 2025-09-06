// Mock para lucide-react en tests
// Esto evita problemas con ESM modules en Jest

const React = require('react');

// Crear un mock component genérico para todos los iconos
const MockIcon = React.forwardRef((props, ref) => 
  React.createElement('svg', {
    'data-testid': 'lucide-icon',
    className: props.className,
    ref,
    ...props
  })
);

MockIcon.displayName = 'MockIcon';

// Exportar todos los iconos comunes que se usan en el proyecto
module.exports = {
  Search: MockIcon,
  ArrowUpDown: MockIcon,
  ChevronUp: MockIcon,
  ChevronDown: MockIcon,
  Briefcase: MockIcon,
  Edit: MockIcon,
  Trash2: MockIcon,
  GanttChartSquare: MockIcon,
  Loader2: MockIcon,
  DollarSign: MockIcon,
  Eye: MockIcon,
  EyeOff: MockIcon,
  SquarePen: MockIcon,
  FileText: MockIcon,
  Phone: MockIcon,
  MapPin: MockIcon,
  Clock: MockIcon,
  Wrench: MockIcon,
  Plus: MockIcon,
  X: MockIcon,
  ChevronLeft: MockIcon,
  ChevronRight: MockIcon,
  MoreHorizontal: MockIcon,
  Settings: MockIcon,
  User: MockIcon,
  LogOut: MockIcon,
  Menu: MockIcon,
  Home: MockIcon,
  Calendar: MockIcon,
  Users: MockIcon,
  Package: MockIcon,
  CreditCard: MockIcon,
  PlusCircle: MockIcon,
  Minus: MockIcon,
  Check: MockIcon,
  AlertCircle: MockIcon,
  Info: MockIcon,
  CheckCircle: MockIcon,
  XCircle: MockIcon,
  Download: MockIcon,
  Upload: MockIcon,
  Save: MockIcon,
  Copy: MockIcon,
  Share: MockIcon,
  ExternalLink: MockIcon,
  Refresh: MockIcon,
  Filter: MockIcon,
  SortAsc: MockIcon,
  SortDesc: MockIcon,
  // Agregar más iconos según sea necesario
};