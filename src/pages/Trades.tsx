import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, TrendingUp, TrendingDown, DollarSign, Activity, Search, Edit, Trash2, ArrowUpDown, Download } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Trade {
  id: string;
  ticker: string;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  entry_date: string;
  exit_date: string | null;
  profit_loss: number | null;
  notes: string | null;
  created_at: string;
}

export default function Trades() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "closed">("all");
  const [sortBy, setSortBy] = useState<"date" | "profit" | "ticker">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Form states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    ticker: "",
    entry_price: "",
    exit_price: "",
    quantity: "",
    entry_date: "",
    exit_date: "",
    notes: "",
  });

  // Statistics
  const totalTrades = trades.length;
  const closedTrades = trades.filter(t => t.exit_price !== null);
  const openTrades = trades.filter(t => t.exit_price === null);
  const totalProfitLoss = closedTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
  const winningTrades = closedTrades.filter(t => (t.profit_loss || 0) > 0).length;
  const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadTrades();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortTrades();
  }, [trades, searchQuery, filterStatus, sortBy, sortOrder]);

  const loadTrades = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTrades(data || []);
    } catch (error) {
      console.error("Error loading trades:", error);
      toast.error("Failed to load trades");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTrades = () => {
    let filtered = [...trades];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(trade =>
        trade.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus === "open") {
      filtered = filtered.filter(t => t.exit_price === null);
    } else if (filterStatus === "closed") {
      filtered = filtered.filter(t => t.exit_price !== null);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "date") {
        comparison = new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime();
      } else if (sortBy === "profit") {
        comparison = (a.profit_loss || 0) - (b.profit_loss || 0);
      } else if (sortBy === "ticker") {
        comparison = a.ticker.localeCompare(b.ticker);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredTrades(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const entryPrice = parseFloat(formData.entry_price);
      const exitPrice = formData.exit_price ? parseFloat(formData.exit_price) : null;
      const quantity = parseInt(formData.quantity);

      let profitLoss = null;
      if (exitPrice !== null) {
        profitLoss = (exitPrice - entryPrice) * quantity;
      }

      const tradeData = {
        ticker: formData.ticker.toUpperCase(),
        entry_price: entryPrice,
        exit_price: exitPrice,
        quantity,
        entry_date: formData.entry_date,
        exit_date: formData.exit_date || null,
        profit_loss: profitLoss,
        notes: formData.notes || null,
        user_id: user?.id,
      };

      if (editingTrade) {
        const { error } = await supabase
          .from("trades")
          .update(tradeData)
          .eq("id", editingTrade.id);

        if (error) throw error;
        toast.success("Trade updated successfully");
      } else {
        const { error } = await supabase
          .from("trades")
          .insert(tradeData);

        if (error) throw error;
        toast.success("Trade added successfully");
      }

      resetForm();
      setDialogOpen(false);
      loadTrades();
    } catch (error) {
      console.error("Error saving trade:", error);
      toast.error("Failed to save trade");
    }
  };

  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade);
    setFormData({
      ticker: trade.ticker,
      entry_price: trade.entry_price.toString(),
      exit_price: trade.exit_price?.toString() || "",
      quantity: trade.quantity.toString(),
      entry_date: trade.entry_date,
      exit_date: trade.exit_date || "",
      notes: trade.notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!tradeToDelete) return;

    try {
      const { error } = await supabase
        .from("trades")
        .delete()
        .eq("id", tradeToDelete);

      if (error) throw error;

      toast.success("Trade deleted successfully");
      loadTrades();
    } catch (error) {
      console.error("Error deleting trade:", error);
      toast.error("Failed to delete trade");
    } finally {
      setDeleteDialogOpen(false);
      setTradeToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      ticker: "",
      entry_price: "",
      exit_price: "",
      quantity: "",
      entry_date: "",
      exit_date: "",
      notes: "",
    });
    setEditingTrade(null);
  };

  const exportTrades = () => {
    const csv = [
      ["Ticker", "Entry Price", "Exit Price", "Quantity", "Entry Date", "Exit Date", "P&L", "Notes"].join(","),
      ...filteredTrades.map(t => [
        t.ticker,
        t.entry_price,
        t.exit_price || "",
        t.quantity,
        t.entry_date,
        t.exit_date || "",
        t.profit_loss || "",
        `"${t.notes || ""}"`,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trades-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (authLoading || loading) {
    return (
      <Layout sidebarOpen={true} onSidebarToggle={() => {}} chats={[]} activeChat={null} onChatSelect={() => {}} onNewChat={() => {}}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebarOpen={true} onSidebarToggle={() => {}} chats={[]} activeChat={null} onChatSelect={() => {}} onNewChat={() => {}}>
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trading Journal</h1>
            <p className="text-muted-foreground mt-1">Track and analyze your trading performance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportTrades} disabled={filteredTrades.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Trade
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingTrade ? "Edit Trade" : "Add New Trade"}</DialogTitle>
                    <DialogDescription>
                      {editingTrade ? "Update trade details" : "Enter your trade information"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ticker">Ticker Symbol *</Label>
                        <Input
                          id="ticker"
                          placeholder="AAPL"
                          value={formData.ticker}
                          onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="100"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="entry_price">Entry Price *</Label>
                        <Input
                          id="entry_price"
                          type="number"
                          step="0.01"
                          placeholder="150.50"
                          value={formData.entry_price}
                          onChange={(e) => setFormData({ ...formData, entry_price: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="exit_price">Exit Price</Label>
                        <Input
                          id="exit_price"
                          type="number"
                          step="0.01"
                          placeholder="155.75"
                          value={formData.exit_price}
                          onChange={(e) => setFormData({ ...formData, exit_price: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="entry_date">Entry Date *</Label>
                        <Input
                          id="entry_date"
                          type="date"
                          value={formData.entry_date}
                          onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="exit_date">Exit Date</Label>
                        <Input
                          id="exit_date"
                          type="date"
                          value={formData.exit_date}
                          onChange={(e) => setFormData({ ...formData, exit_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Trade strategy, reasoning, or observations..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingTrade ? "Update" : "Add"} Trade
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrades}</div>
              <p className="text-xs text-muted-foreground">
                {openTrades.length} open • {closedTrades.length} closed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${totalProfitLoss.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Closed trades only
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {winningTrades} winning trades
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Trade</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${closedTrades.length > 0 ? (totalProfitLoss / closedTrades.length).toFixed(2) : "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                Per closed trade
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle>Trade History</CardTitle>
                <CardDescription>View and manage all your trades</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search trades..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Trades</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTrades.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No trades found</h3>
                <p className="text-muted-foreground mb-4">
                  {trades.length === 0 
                    ? "Start tracking your trades by adding your first trade"
                    : "Try adjusting your filters or search query"}
                </p>
                {trades.length === 0 && (
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Trade
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticker</TableHead>
                      <TableHead>Entry</TableHead>
                      <TableHead>Exit</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>P&L</TableHead>
                      <TableHead>Entry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrades.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell className="font-bold">{trade.ticker}</TableCell>
                        <TableCell>${trade.entry_price.toFixed(2)}</TableCell>
                        <TableCell>
                          {trade.exit_price ? `$${trade.exit_price.toFixed(2)}` : "-"}
                        </TableCell>
                        <TableCell>{trade.quantity}</TableCell>
                        <TableCell>
                          {trade.profit_loss !== null ? (
                            <span className={trade.profit_loss >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                              ${trade.profit_loss.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{new Date(trade.entry_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={trade.exit_price ? "default" : "secondary"}>
                            {trade.exit_price ? "Closed" : "Open"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(trade)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setTradeToDelete(trade.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trade? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
