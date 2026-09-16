import {
  permanentRedirect,
} from "next/navigation";

export default function LegacyLaptopComparisonPage() {
  permanentRedirect(
    "/karsilastirma/laptop"
  );
}