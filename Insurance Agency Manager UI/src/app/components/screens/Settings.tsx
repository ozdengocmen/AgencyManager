import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

export function Settings() {
  return (
    <div className="flex-1 overflow-auto">
      <ScrollArea className="h-full">
        <div className="p-8 space-y-8 max-w-4xl">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-1">Manage your preferences and configuration</p>
          </div>

          {/* Work Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Work Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="start-location">Default Start Location</Label>
                <Select defaultValue="office">
                  <SelectTrigger id="start-location">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-600">
                  Starting point for route optimization
                </p>
              </div>

              <div className="space-y-2">
                <Label>Working Hours</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time" className="text-sm text-slate-600">Start Time</Label>
                    <Input id="start-time" type="time" defaultValue="09:00" />
                  </div>
                  <div>
                    <Label htmlFor="end-time" className="text-sm text-slate-600">End Time</Label>
                    <Input id="end-time" type="time" defaultValue="17:00" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Route Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Route Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="max-visits">Maximum Visits per Day</Label>
                <Input 
                  id="max-visits" 
                  type="number" 
                  defaultValue="5" 
                  min="1" 
                  max="10"
                />
                <p className="text-sm text-slate-600">
                  Recommended maximum number of agency visits in a single day
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-travel">Maximum Travel Time (hours)</Label>
                <Input 
                  id="max-travel" 
                  type="number" 
                  defaultValue="4" 
                  min="1" 
                  max="8"
                  step="0.5"
                />
                <p className="text-sm text-slate-600">
                  Maximum total travel time per day
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avg-visit">Average Visit Duration (minutes)</Label>
                <Input 
                  id="avg-visit" 
                  type="number" 
                  defaultValue="45" 
                  min="15" 
                  max="120"
                  step="15"
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant Settings */}
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Always Include Benchmarks</Label>
                  <p className="text-sm text-slate-600">
                    Include portfolio benchmarks in AI-generated narratives
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-generate Meeting Notes</Label>
                  <p className="text-sm text-slate-600">
                    Automatically create notes template when adding agency to plan
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Priority Notifications</Label>
                  <p className="text-sm text-slate-600">
                    Receive alerts for high-priority agencies and renewal risks
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-tone">Default Narrative Tone</Label>
                <Select defaultValue="consultative">
                  <SelectTrigger id="default-tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="consultative">Consultative</SelectItem>
                    <SelectItem value="assertive">Assertive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Visit Reminders</Label>
                  <p className="text-sm text-slate-600">
                    Receive reminders for upcoming visits
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Task Due Date Alerts</Label>
                  <p className="text-sm text-slate-600">
                    Get notified about approaching task deadlines
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Performance Alerts</Label>
                  <p className="text-sm text-slate-600">
                    Notifications for significant KPI changes
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="John Smith" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.smith@company.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select defaultValue="salesperson">
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salesperson">Salesperson</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
