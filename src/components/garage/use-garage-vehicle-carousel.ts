"use client";

import { useEffect, useRef } from "react";
import type { Vehicle } from "@/types/database";

interface UseGarageVehicleCarouselOptions {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (vehicleId: string) => void;
}

export function useGarageVehicleCarousel({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
}: UseGarageVehicleCarouselOptions) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSelectedIndex = useRef(
    vehicles.findIndex((vehicle) => vehicle.id === selectedVehicleId),
  );
  const selectedIndex = Math.max(
    vehicles.findIndex((vehicle) => vehicle.id === selectedVehicleId),
    0,
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    const selectedSlide = Array.from(
      viewport?.querySelectorAll<HTMLElement>("[data-vehicle-id]") ?? [],
    ).find((slide) => slide.dataset.vehicleId === selectedVehicleId);
    if (!selectedSlide) return;

    const selectionDistance = Math.abs(
      selectedIndex - lastSelectedIndex.current,
    );
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    selectedSlide.scrollIntoView({
      behavior: reduceMotion || selectionDistance > 1 ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
    lastSelectedIndex.current = selectedIndex;
  }, [selectedIndex, selectedVehicleId]);

  useEffect(
    () => () => {
      if (scrollTimer.current !== null) clearTimeout(scrollTimer.current);
    },
    [],
  );

  const moveBy = (offset: number) => {
    if (vehicles.length < 2) return;
    const nextIndex =
      (selectedIndex + offset + vehicles.length) % vehicles.length;
    const nextVehicle = vehicles[nextIndex];
    if (nextVehicle) onSelectVehicle(nextVehicle.id);
  };

  const handleScroll = () => {
    if (scrollTimer.current !== null) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const viewportCenter =
        viewport.getBoundingClientRect().left + viewport.clientWidth / 2;
      const slides = Array.from(
        viewport.querySelectorAll<HTMLElement>("[data-vehicle-id]"),
      );
      const nearestSlide = slides.reduce<HTMLElement | undefined>(
        (nearest, slide) => {
          if (!nearest) return slide;
          const slideCenter =
            slide.getBoundingClientRect().left + slide.clientWidth / 2;
          const nearestCenter =
            nearest.getBoundingClientRect().left + nearest.clientWidth / 2;
          return Math.abs(slideCenter - viewportCenter) <
            Math.abs(nearestCenter - viewportCenter)
            ? slide
            : nearest;
        },
        undefined,
      );
      const nearestId = nearestSlide?.dataset.vehicleId;
      if (nearestId && nearestId !== selectedVehicleId) {
        onSelectVehicle(nearestId);
      }
    }, 140);
  };

  return {
    viewportRef,
    selectedIndex,
    moveBy,
    handleScroll,
  };
}
