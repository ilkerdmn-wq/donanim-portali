export interface HardwareItem {
  id: string;
  name: string;
  price: number;
  desc?: string;
  specs: Record<string, string>;
}

export const hardwareData: Record<string, HardwareItem[]> = {
  islemci: [
    {
      id: "ryzen-5-7600",
      name: "AMD Ryzen 5 7600",
      price: 7500,
      desc: "AM5 soket yapısına sahip, yüksek performanslı yeni nesil işlemci.",
      specs: { "Soket": "AM5", "Çekirdek": "6", "İş Parçacığı": "12" }
    },
    {
      id: "intel-i5-13400f",
      name: "Intel Core i5-13400F",
      price: 7200,
      desc: "LGA1700 soket destekli ekonomik ve güçlü işlemci.",
      specs: { "Soket": "LGA1700", "Çekirdek": "10", "İş Parçacığı": "16" }
    }
  ],
  "ekran-karti": [
    {
      id: "rtx-4060",
      name: "NVIDIA GeForce RTX 4060",
      price: 14000,
      desc: "1080p ve 1440p oyunlar için DLSS 3 destekli ekran kartı.",
      specs: { "VRAM": "8GB", "Mimari": "Ada Lovelace" }
    },
    {
      id: "rtx-4070",
      name: "NVIDIA GeForce RTX 4070",
      price: 24000,
      desc: "Yüksek kare hızları ve 2K oyun deneyimi sunar.",
      specs: { "VRAM": "12GB", "Mimari": "Ada Lovelace" }
    }
  ],
  anakart: [
    {
      id: "b650-m",
      name: "MSI PRO B650M-A WIFI",
      price: 6000,
      desc: "AM5 işlemciler için DDR5 destekli anakart.",
      specs: { "Soket": "AM5", "Tür": "DDR5", "Boyut": "mATX" }
    },
    {
      id: "h610m",
      name: "ASUS PRIME H610M-R",
      price: 3500,
      desc: "LGA1700 soket ekonomik anakart çözümü.",
      specs: { "Soket": "LGA1700", "Tür": "DDR4", "Boyut": "mATX" }
    }
  ],
  ram: [
    {
      id: "corsair-16gb-ddr5",
      name: "Corsair Vengeance 16GB (1x16GB) 5600MHz DDR5",
      price: 2200,
      desc: "Yüksek hızlı DDR5 bellek kiti.",
      specs: { "Tür": "DDR5", "Kapasite": "16GB", "Hız": "5600MHz" }
    },
    {
      id: "kingston-16gb-ddr4",
      name: "Kingston Fury Beast 16GB 3200MHz DDR4",
      price: 1600,
      desc: "DDR4 sistemler için kararlı bellek.",
      specs: { "Tür": "DDR4", "Kapasite": "16GB", "Hız": "3200MHz" }
    }
  ],
  psu: [
    {
      id: "msi-650w",
      name: "MSI MAG A650BN 650W 80+ Bronze",
      price: 2500,
      desc: "Güvenilir ve sertifikalı güç kaynağı.",
      specs: { "Güç": "650W", "Sertifika": "80+ Bronze" }
    }
  ],
  ssd: [
    {
      id: "kingston-1tb-ssd",
      name: "Kingston NV2 1TB NVMe M.2 SSD",
      price: 2800,
      desc: "Yüksek okuma/yazma hızlarına sahip M.2 SSD.",
      specs: { "Kapasite": "1TB", "Okuma": "3500 MB/s" }
    }
  ]
};