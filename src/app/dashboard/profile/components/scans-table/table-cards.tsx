"use client";

import { useEffect, useState } from "react";

import { collection, doc, onSnapshot, orderBy, query, where } from "firebase/firestore";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardAction } from "@/components/ui/card";
import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { FIREBASE_COLLECTION_ENUMS } from "@/enums/firebase";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import useUser from "@/hooks/use-user";
import { ScanLogType } from "@/types/log";

import { scanResultsColumns } from "./columns";
import { recentLeadsData } from "./crm.config";

export function ScanResultsTable() {
  const { user, userData } = useUser();
  const [tableData, setTableData] = useState<ScanLogType[]>([]);

  const table = useDataTableInstance({
    data: tableData,
    columns: scanResultsColumns,
    getRowId: (row) => row.id.toString(),
  });

  useEffect(() => {
    if (!user || !userData) {
      return;
    }

    const userDocRef = doc(USERS_COLLECTION_REF, user.uid);
    const userLogsCollection = collection(userDocRef, FIREBASE_COLLECTION_ENUMS.LOGS_COLLECTION);
    const scanLogsQuery = query(userLogsCollection, where("logType", "==", "scan"), orderBy("date", "desc"));

    const unsubscribe = onSnapshot(scanLogsQuery, (snapshot) => {
      const fetchedData: ScanLogType[] = [];

      for (const doc of snapshot.docs) {
        const scanLog = doc.data() as ScanLogType;
        fetchedData.push(scanLog);
      }

      setTableData(fetchedData);
    });

    return () => unsubscribe();
  }, [user, userData]);

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs">
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>Track and manage your latest scans and their status.</CardDescription>
          <CardAction>
            <div className="flex items-center gap-2">
              <DataTableViewOptions table={table} />
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="flex size-full flex-col gap-4">
          <div className="overflow-hidden rounded-md border">
            <DataTable table={table} columns={scanResultsColumns} />
          </div>
          <DataTablePagination table={table} />
        </CardContent>
      </Card>
    </div>
  );
}
