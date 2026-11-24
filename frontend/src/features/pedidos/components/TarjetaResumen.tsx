import Card from "@/shared/ui/Card";

interface Props {
  titulo: string;
  valor: string | number;
  color?: string;
}

export default function TarjetaResumen({ titulo, valor, color = "text-stone-900" }: Props) {
  return (
    <Card>
      <p className="text-sm font-medium text-stone-500">{titulo}</p>
      <p className={`mt-1 text-3xl font-extrabold ${color}`}>{valor}</p>
    </Card>
  );
}
