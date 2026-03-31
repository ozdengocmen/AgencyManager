import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { Calendar, CheckCircle2, Circle, Clock, Sparkles } from "lucide-react";
import { mockTasks, mockAgencies } from "../../data/mockData";

export function TasksFollowUps() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredTasks = mockTasks.filter(task => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Circle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default" as const,
      "in-progress": "secondary" as const,
      pending: "outline" as const,
    };
    return variants[status as keyof typeof variants] || "outline";
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "destructive" as const,
      medium: "secondary" as const,
      low: "outline" as const,
    };
    return variants[priority as keyof typeof variants] || "outline";
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-white px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tasks & Follow-ups</h1>
            <p className="text-slate-600 mt-1">{filteredTasks.length} tasks</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Suggestions
            </Button>
            <Button>Create Task</Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Helper Section */}
      <div className="bg-blue-50 border-b px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-slate-900">AI Assistant</p>
              <p className="text-sm text-slate-600">Get intelligent task recommendations</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Suggest Top 10 Follow-ups
            </Button>
            <Button variant="outline" size="sm">
              Summarize Outstanding Risks
            </Button>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <ScrollArea className="flex-1">
        <div className="p-8">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => {
                    const agency = mockAgencies.find(a => a.agency_id === task.agency_id);
                    const dueDate = new Date(task.due_date);
                    const today = new Date();
                    const isOverdue = dueDate < today && task.status !== "completed";
                    
                    return (
                      <TableRow key={task.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(task.status)}
                              <span className="font-medium">{task.title}</span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {agency && (
                            <Link 
                              to={`/app/agencies/${agency.agency_id}`}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {agency.agency_name}
                            </Link>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                              {dueDate.toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          {isOverdue && (
                            <Badge variant="destructive" className="text-xs mt-1">Overdue</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityBadge(task.priority)} className="capitalize">
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadge(task.status)} className="capitalize">
                            {task.status.replace("-", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm">Complete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Task Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pending</span>
                    <span className="font-semibold">{mockTasks.filter(t => t.status === "pending").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">In Progress</span>
                    <span className="font-semibold">{mockTasks.filter(t => t.status === "in-progress").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Completed</span>
                    <span className="font-semibold">{mockTasks.filter(t => t.status === "completed").length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">High Priority</span>
                    <span className="font-semibold text-red-600">{mockTasks.filter(t => t.priority === "high").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Medium Priority</span>
                    <span className="font-semibold text-amber-600">{mockTasks.filter(t => t.priority === "medium").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Low Priority</span>
                    <span className="font-semibold">{mockTasks.filter(t => t.priority === "low").length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">
                  You have 2 high-priority tasks related to agencies with renewal risk. 
                  Consider prioritizing these for immediate action.
                </p>
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Recommendations
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
