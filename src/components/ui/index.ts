/**
 * Barrel export para componentes UI más utilizados
 * 
 * Facilita las importaciones agrupando los componentes más comunes
 * en una sola importación.
 */

// ===== COMPONENTES BÁSICOS =====
export { Button } from './button';
export { Input } from './input';
export { Label } from './label';
export { Textarea } from './textarea';
export { Checkbox } from './checkbox';
export { Switch } from './switch';

// ===== SELECTORES Y DROPDOWNS =====
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './select';

export { MultiSelect } from './multi-select';

export {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';

// ===== FORMULARIOS =====
export {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';

// ===== CARDS Y CONTENEDORES =====
export { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from './card';

export { Separator } from './separator';

// ===== DIÁLOGOS Y MODALES =====
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

// ===== SISTEMA DE MODALES AVANZADO =====
export {
  Modal,
  ModalProvider,
  ModalRoot,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalActions,
  ModalAction,
  useModal,
  useModalState,
  type ModalSize,
  type BaseModalProps
} from './modal';

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';

export {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

// ===== NAVEGACIÓN =====
export {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './tabs';

export { Badge } from './badge';

// ===== TABLAS =====
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

// ===== FEEDBACK Y ESTADO =====
export { toast } from 'sonner';
export { Toaster } from './sonner';
export { Skeleton } from './skeleton';
export { Progress } from './progress';

export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

// ===== UTILIDADES VISUALES =====
export { Avatar, AvatarFallback, AvatarImage } from './avatar';
export { Calendar } from './calendar';
export { ScrollArea, ScrollBar } from './scroll-area';

// ===== INPUTS ESPECIALIZADOS =====
export { PhoneInput } from './phone-input';
export { AddressInput } from './addressInput';
export { MoneyInput } from './money-input';
export { DateInput } from './date-input';
// Autocomplete moved to: @/components/custom/autocomplete
export { CheckList } from './check-list';

// ===== COMPONENTES PERSONALIZADOS =====
// Tag components moved to: @/components/custom/uninstall-tags
export { useSafeDialog } from './safe-dialog';
export { CopyableCodeBlock } from './copyable-code-block';
export { FileDndInput } from './file-dnd-input';