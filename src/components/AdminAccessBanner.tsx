import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';

interface AdminAccessBannerProps {
  userName: string;
  onBackToAdmin: () => void;
}

export function AdminAccessBanner({ userName, onBackToAdmin }: AdminAccessBannerProps) {
  return (
    <div 
      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 shadow-lg border-b-2 border-amber-600"
      data-testid="banner-admin-access"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5" />
          <div>
            <p className="font-semibold">
              Modo Administrador Activo
            </p>
            <p className="text-sm text-amber-100">
              Estás viendo como: <span className="font-medium">{userName}</span>
            </p>
          </div>
        </div>
        
        <Button
          onClick={onBackToAdmin}
          variant="outline"
          size="sm"
          className="bg-white text-orange-600 hover:bg-amber-50 hover:text-orange-700 border-white"
          data-testid="button-back-to-admin"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Admin
        </Button>
      </div>
    </div>
  );
}