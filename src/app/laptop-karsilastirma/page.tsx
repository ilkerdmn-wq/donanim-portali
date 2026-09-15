import type {Metadata} from "next";
import ComparisonClient from "./ComparisonClient";
import {readComparison} from "@/app/lib/manual-comparison-server";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Laptop Karşılaştırma",description:"Donanım Portalı incelemelerinde yer alan laptopların özelliklerini yan yana karşılaştırın.",alternates:{canonical:"https://donanimportali.com/laptop-karsilastirma"}};
export default async function Page(){const document=await readComparison();return <ComparisonClient document={document?.published?document:null}/>}
