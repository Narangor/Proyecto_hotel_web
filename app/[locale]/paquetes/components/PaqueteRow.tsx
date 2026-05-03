"use client";

import {
  Calendar,
  Edit2,
  Package,
  Sparkles,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import type { PaquetePromocional } from "@/types";
import { PAQUETE_ESTADOS_ELIMINABLES } from "@/types";

interface PaqueteRowProps {
  paquete: PaquetePromocional;
  onEditar: (p: PaquetePromocional) => void;
  onEliminar: (p: PaquetePromocional) => void;
}

const ESTADO_VARIANT: Record<string, BadgeVariant> = {
  activo: "completado",
  inactivo: "pendiente",
  agotado: "rechazado",
};

function formatCop(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatFecha(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function getPackageImage(nombre: string): string {
  const normalizedName = nombre.toLowerCase();

  if (normalizedName.includes("familia")) {
    return "https://media.bookmundi.com/aggregate-hero-images/indonesia/family-tour-packages/cropped.jpg?format=auto&quality=60&width=1920";
  }
  if (
    normalizedName.includes("romántica") ||
    normalizedName.includes("romantica") ||
    normalizedName.includes("escapada")
  ) {
    return "https://assets.insuremytrip.com/wp-content/uploads/2024/04/05182330/how_to_help_clients_plan_romantic_getaway.jpg";
  }
  if (normalizedName.includes("early") || normalizedName.includes("bird")) {
    return "https://images.ajc.com/resizer/v2/NDZZ2CLQ5FMIQ3FCMS44MI3CUA.jpg?auth=7da404d9cac3055ac479594dc287273bdeab1f9abeff395c701ac579e74b3871&width=3840&height=2160&smart=true";
  }

  return "https://placehold.co/600x400/F5F0E8/8B6F47?text=Package+Image";
}

export function PaqueteRow({ paquete, onEditar, onEliminar }: PaqueteRowProps) {
  const t = useTranslations("paquetes");
  const tCommon = useTranslations("common");

  const descuento =
    paquete.precioLista > 0
      ? Math.round((1 - paquete.precioPromocional / paquete.precioLista) * 100)
      : 0;

  const puedeEliminar = PAQUETE_ESTADOS_ELIMINABLES.includes(paquete.estado);
  const porcentajeOcupacion =
    paquete.cuposTotales > 0
      ? (paquete.cuposVendidos / paquete.cuposTotales) * 100
      : 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-brown-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:border-gold-300">
      {descuento > 0 && (
        <div className="absolute right-4 top-4 z-10 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-gold-600 shadow-lg">
          <span className="text-2xl font-bold text-white leading-none">
            {descuento}%
          </span>
          <span className="text-[10px] font-medium uppercase text-white/90">
            OFF
          </span>
        </div>
      )}

      <div className="absolute left-4 top-4 z-10">
        <Badge
          variant={ESTADO_VARIANT[paquete.estado] ?? "pendiente"}
          label={t(`estados.${paquete.estado}`)}
        />
      </div>

      <div className="relative h-40 bg-gradient-to-br from-gold-100 via-brown-50 to-cream overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Package className="h-20 w-20 text-brown-400" aria-hidden />
        </div>
        <img
          src={getPackageImage(paquete.nombre)}
          alt=""
          className="h-full w-full object-cover opacity-60"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3">
          <h3 className="mb-1 font-serif text-lg font-bold text-brown-900 line-clamp-1">
            {paquete.nombre}
          </h3>
          <p className="text-xs font-mono text-brown-400">
            #{paquete.id.slice(-8).toUpperCase()}
          </p>
        </div>

        <p className="mb-4 text-sm text-brown-600 line-clamp-2">
          {paquete.descripcion}
        </p>

        <div className="mb-4 rounded-lg bg-gold-50/50 border border-gold-200 p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t("campos.incluye")}
          </div>
          <p className="text-xs text-brown-700 line-clamp-2">
            {paquete.incluye}
          </p>
        </div>

        <div className="mb-4 flex items-start gap-2 text-sm">
          <Calendar
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-brown-400"
            aria-hidden
          />
          <div className="flex-1">
            <div className="text-xs font-medium text-brown-500 uppercase tracking-wide">
              {t("tabla.vigencia")}
            </div>
            <div className="text-sm text-brown-700">
              {formatFecha(paquete.fechaInicioVigencia)} —{" "}
              {formatFecha(paquete.fechaFinVigencia)}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-medium text-brown-600">
              <Users className="h-3.5 w-3.5" aria-hidden />
              {t("tabla.cupos")}
            </div>
            <span className="font-semibold text-brown-700">
              {paquete.cuposVendidos} / {paquete.cuposTotales}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-brown-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-600 transition-all duration-300"
              style={{ width: `${Math.min(porcentajeOcupacion, 100)}%` }}
              role="progressbar"
              aria-valuenow={paquete.cuposVendidos}
              aria-valuemin={0}
              aria-valuemax={paquete.cuposTotales}
              aria-label={`${paquete.cuposVendidos} of ${paquete.cuposTotales} slots sold`}
            />
          </div>
        </div>

        <div className="mb-4 rounded-xl bg-gradient-to-br from-brown-50 to-gold-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-brown-400" aria-hidden />
            <span className="text-xs font-medium uppercase tracking-wide text-brown-500">
              {t("tabla.precios")}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-xs text-brown-400 line-through">
                {formatCop(paquete.precioLista)}
              </div>
              <div className="font-serif text-2xl font-bold text-gold-700">
                {formatCop(paquete.precioPromocional)}
              </div>
            </div>
            {descuento > 0 && (
              <div className="text-right">
                <div className="text-xs text-brown-500">
                  {t("tabla.descuento", { pct: descuento })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <button
            type="button"
            onClick={() => onEditar(paquete)}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-brown-300 bg-white px-4 py-2.5 text-sm font-medium text-brown-700 transition-all duration-150 hover:bg-brown-50 hover:border-brown-400 focus:outline-none focus:ring-2 focus:ring-gold-200"
            aria-label={`${tCommon("edit")} ${paquete.nombre}`}
          >
            <Edit2 className="h-4 w-4" aria-hidden />
            {tCommon("edit")}
          </button>
          {puedeEliminar && (
            <button
              type="button"
              onClick={() => onEliminar(paquete)}
              className="flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition-all duration-150 hover:bg-red-50 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              aria-label={`${tCommon("delete")} ${paquete.nombre}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
