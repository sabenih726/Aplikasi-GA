
import { useQueue } from "@/context/QueueContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";

const ServiceSelection = () => {
  const { services } = useQueue();

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Status Layanan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jenis Layanan</TableHead>
              <TableHead className="text-right">Kode</TableHead>
              <TableHead className="text-right">Menunggu</TableHead>
              <TableHead className="text-right">Telah Dilayani</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell className="text-right">{service.prefix}</TableCell>
                <TableCell className="text-right">{service.waiting}</TableCell>
                <TableCell className="text-right">{service.served}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ServiceSelection;
