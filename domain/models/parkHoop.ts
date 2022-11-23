export interface ParkHoop {
  hoop_id: number;
  park_id: number;
  hoop_count: number;
  hoop_type: number;
}

export interface Values {
  park_id: number;
  hoop_count: number;
  hoop_type: number | null;
}

export interface DisplayParkHoop {
  hoop_id: number;
  park_id: number;
  hoop_count: number;
  hoop_type: number;
}

export function factory(values: Values[]): ParkHoop[] {
  const parkHoops = values.reduce(
      (previousValue: ParkHoop[], currentValue, currentIndex): ParkHoop[] => {
        if (currentValue.hoop_type !== null) {
          return [
            ...previousValue,
            {
              hoop_id: previousValue.length + 1,
              park_id: currentValue.park_id,
              hoop_count: currentValue.hoop_count,
              hoop_type: currentValue.hoop_type,
            },
          ];
        }
        return [...previousValue];
      },
      [],
  );

  return parkHoops;
}
