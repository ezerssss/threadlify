"use client";

import { collection, doc, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { FIREBASE_COLLECTION_ENUMS } from "@/enums/firebase";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { PaymentLogType, ScanLogType } from "@/types/log";

import { paymentLogsColumns } from "./payment-logs-columns";
import { scanLogsColumns } from "./scan-logs-columns";

interface UserLogsProps {
  readonly userId: string;
}

export function UserLogs({ userId }: UserLogsProps) {
  const [scanLogs, setScanLogs] = useState<ScanLogType[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLogType[]>([]);
  const [isLoadingScanLogs, setIsLoadingScanLogs] = useState(true);
  const [isLoadingPaymentLogs, setIsLoadingPaymentLogs] = useState(true);

  const scanLogsTable = useDataTableInstance({
    data: scanLogs,
    columns: scanLogsColumns,
    getRowId: (row) => row.id.toString(),
  });

  const paymentLogsTable = useDataTableInstance({
    data: paymentLogs,
    columns: paymentLogsColumns,
    getRowId: (row) => row.id.toString(),
  });

  function renderScanLogsContent() {
    if (isLoadingScanLogs) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground text-sm">Loading scan logs...</p>
        </div>
      );
    }
    if (scanLogs.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground text-sm">No scan logs found.</p>
        </div>
      );
    }
    return (
      <>
        <div className="overflow-hidden rounded-md border">
          <DataTable table={scanLogsTable} columns={scanLogsColumns} />
        </div>
        <DataTablePagination table={scanLogsTable} />
      </>
    );
  }

  function renderPaymentLogsContent() {
    if (isLoadingPaymentLogs) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground text-sm">Loading payment logs...</p>
        </div>
      );
    }
    if (paymentLogs.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground text-sm">No payment logs found.</p>
        </div>
      );
    }
    return (
      <>
        <div className="overflow-hidden rounded-md border">
          <DataTable table={paymentLogsTable} columns={paymentLogsColumns} />
        </div>
        <DataTablePagination table={paymentLogsTable} />
      </>
    );
  }

  useEffect(() => {
    if (!userId) {
      return;
    }

    const userDocRef = doc(USERS_COLLECTION_REF, userId);
    const userLogsCollection = collection(userDocRef, FIREBASE_COLLECTION_ENUMS.LOGS_COLLECTION);

    // Fetch scan logs
    const scanLogsQuery = query(userLogsCollection, where("logType", "==", "scan"), orderBy("date", "desc"));
    const unsubscribeScanLogs = onSnapshot(
      scanLogsQuery,
      (snapshot) => {
        const fetchedData: ScanLogType[] = [];
        for (const doc of snapshot.docs) {
          fetchedData.push(doc.data() as ScanLogType);
        }
        setScanLogs(fetchedData);
        setIsLoadingScanLogs(false);
      },
      (error) => {
        console.error("Error fetching scan logs:", error);
        setIsLoadingScanLogs(false);
      },
    );

    // Fetch payment logs
    const paymentLogsQuery = query(userLogsCollection, where("logType", "==", "payment"), orderBy("createdAt", "desc"));
    const unsubscribePaymentLogs = onSnapshot(
      paymentLogsQuery,
      (snapshot) => {
        const fetchedData: PaymentLogType[] = [];
        for (const doc of snapshot.docs) {
          fetchedData.push(doc.data() as PaymentLogType);
        }
        setPaymentLogs(fetchedData);
        setIsLoadingPaymentLogs(false);
      },
      (error) => {
        console.error("Error fetching payment logs:", error);
        setIsLoadingPaymentLogs(false);
      },
    );

    return () => {
      unsubscribeScanLogs();
      unsubscribePaymentLogs();
    };
  }, [userId]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="scans" className="w-full">
        <TabsList>
          <TabsTrigger value="scans">Scan Logs ({scanLogs.length})</TabsTrigger>
          <TabsTrigger value="payments">Payment Logs ({paymentLogs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="scans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan Logs</CardTitle>
              <CardDescription>Track all scan activities for this user.</CardDescription>
              <CardAction>
                <div className="flex items-center gap-2">
                  <DataTableViewOptions table={scanLogsTable} />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent className="flex size-full flex-col gap-4">{renderScanLogsContent()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Logs</CardTitle>
              <CardDescription>Track all payment transactions for this user.</CardDescription>
              <CardAction>
                <div className="flex items-center gap-2">
                  <DataTableViewOptions table={paymentLogsTable} />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent className="flex size-full flex-col gap-4">{renderPaymentLogsContent()}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
