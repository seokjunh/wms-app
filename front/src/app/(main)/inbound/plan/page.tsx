import DataTable from "@/components/DataTable";
import data from "./data.json";

const page = () => {
  return <DataTable data={data} />;
};
export default page;
