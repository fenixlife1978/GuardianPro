import { ReportCharts } from "@/components/admin/report-charts";

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Monitor de Reportes</h2>
        <p className="text-muted-foreground">Visualiza el uso de dispositivos y las infracciones.</p>
      </div>
      <ReportCharts />
    </div>
  );
}
