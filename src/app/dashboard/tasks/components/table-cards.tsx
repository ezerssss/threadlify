"use client";

import { useEffect, useState } from "react";

import { collection, doc, onSnapshot } from "firebase/firestore";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { FIREBASE_COLLECTION_ENUMS } from "@/enums/firebase";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import useUser from "@/hooks/use-user";
import { ActionableObjectivesType } from "@/types/insights";

import { objectivesColumnSchema } from "./columns";

export function ScanResultsTable() {
  const { user } = useUser();
  const [tableData, setTableData] = useState<ActionableObjectivesType[]>([]);

  const table = useDataTableInstance({
    data: tableData,
    columns: objectivesColumnSchema,
    defaultSortState: [{ id: "numPosts", desc: true }],
    getRowId: (row) => row.id.toString(),
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    const userDocRef = doc(USERS_COLLECTION_REF, user.uid);
    const userTasksCollection = collection(userDocRef, FIREBASE_COLLECTION_ENUMS.OBJECTIVES_COLLECTION);

    const unsubscribe = onSnapshot(userTasksCollection, (snapshot) => {
      const fetchedData: ActionableObjectivesType[] = [];

      for (const doc of snapshot.docs) {
        const task = doc.data() as ActionableObjectivesType;
        fetchedData.push(task);
      }

      setTableData(fetchedData);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs">
      <Card>
        <CardHeader hidden>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>Tasks generated from real user insights.</CardDescription>
        </CardHeader>
        {/* <CardContent className="flex size-full flex-col gap-4">
          <div className="overflow-hidden rounded-md border">
            <DataTable table={table} columns={objectivesColumnSchema} />
          </div>
          <DataTablePagination table={table} />
        </CardContent> */}
      </Card>
    </div>
  );
}
