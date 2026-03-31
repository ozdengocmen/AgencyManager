import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { Agency, Task } from "../../data/mockData";
import type { I18nCopy } from "../../i18n";

export interface TaskEditorFormState {
  agencyId: string;
  title: string;
  dueDate: string;
  priority: Task["priority"];
}

interface TaskEditorDialogProps {
  open: boolean;
  mode: "create" | "edit";
  isCreating: boolean;
  canDelete: boolean;
  form: TaskEditorFormState;
  agencies: Agency[];
  copy: I18nCopy["tasksFollowUps"];
  onOpenChange: (open: boolean) => void;
  onFormChange: (patch: Partial<TaskEditorFormState>) => void;
  onSave: () => void;
  onDelete: () => void;
}

export function TaskEditorDialog({
  open,
  mode,
  isCreating,
  canDelete,
  form,
  agencies,
  copy,
  onOpenChange,
  onFormChange,
  onSave,
  onDelete,
}: TaskEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? copy.createTaskDialogTitle : copy.editTaskDialogTitle}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? copy.createTaskDialogDescription
              : copy.editTaskDialogDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="task-editor-agency">{copy.fieldAgency}</Label>
            <Select
              value={form.agencyId}
              onValueChange={(value) => onFormChange({ agencyId: value })}
            >
              <SelectTrigger id="task-editor-agency">
                <SelectValue placeholder={copy.fieldAgency} />
              </SelectTrigger>
              <SelectContent>
                {agencies.map((agency) => (
                  <SelectItem key={agency.agency_id} value={agency.agency_id}>
                    {agency.agency_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-editor-title">{copy.fieldTitle}</Label>
            <Input
              id="task-editor-title"
              value={form.title}
              onChange={(event) => onFormChange({ title: event.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-editor-due-date">{copy.fieldDueDate}</Label>
              <Input
                id="task-editor-due-date"
                type="date"
                value={form.dueDate}
                onChange={(event) => onFormChange({ dueDate: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-editor-priority">{copy.fieldPriority}</Label>
              <Select
                value={form.priority}
                onValueChange={(value) =>
                  onFormChange({ priority: value as Task["priority"] })
                }
              >
                <SelectTrigger id="task-editor-priority">
                  <SelectValue placeholder={copy.fieldPriority} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{copy.priorityHigh}</SelectItem>
                  <SelectItem value="medium">{copy.priorityMedium}</SelectItem>
                  <SelectItem value="low">{copy.priorityLow}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          {mode === "edit" && canDelete ? (
            <Button variant="destructive" onClick={onDelete}>
              {copy.deleteTask}
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {copy.cancel}
          </Button>
          <Button onClick={onSave} disabled={isCreating}>
            {mode === "create"
              ? isCreating
                ? copy.creatingTask
                : copy.saveTask
              : copy.updateTask}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
