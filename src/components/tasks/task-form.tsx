"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import type { TaskInput } from "@/types";

interface TaskFormProps {
  onSubmit: (data: TaskInput & { tags?: string[] }) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<TaskInput & { tags?: string[] }>;
  submitLabel?: string;
}

const TAG_OPTIONS = [
  "Работа",
  "Личное",
  "Учёба",
  "Здоровье",
  "Финансы",
  "Проект",
  "Покупки",
  "Идеи",
];

export default function TaskForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = "Создать задачу",
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [priority, setPriority] = useState(initialData?.priority || "MEDIUM");
  const [status, setStatus] = useState(initialData?.status || "PLANNED");
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate
      ? String(initialData.dueDate).split("T")[0]
      : ""
  );
  const [tags, setTags] = useState<string[]>(Array.isArray(initialData?.tags) ? initialData.tags : []);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate: dueDate || null,
        tags,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Название *</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Введите название задачи"
          required
          autoFocus
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Описание</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Добавьте описание задачи..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Приоритет</label>
          <Select
            value={priority}
            onValueChange={(v) => setPriority(v as "LOW" | "MEDIUM" | "HIGH")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HIGH">🔴 Высокий</SelectItem>
              <SelectItem value="MEDIUM">🟡 Средний</SelectItem>
              <SelectItem value="LOW">🟢 Низкий</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Статус</label>
          <Select
            value={status}
            onValueChange={(v) =>
              setStatus(v as "PLANNED" | "IN_PROGRESS" | "COMPLETED")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PLANNED">📋 В планах</SelectItem>
              <SelectItem value="IN_PROGRESS">⚡ В процессе</SelectItem>
              <SelectItem value="COMPLETED">✅ Выполнено</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Дедлайн</label>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Теги</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Select
            value={newTag}
            onValueChange={(v) => {
              if (v === "custom") {
                // open input for custom tag
              } else if (v) {
                addTag(v);
              }
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Выберите тег" />
            </SelectTrigger>
            <SelectContent>
              {TAG_OPTIONS.filter((t) => !tags.includes(t)).map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
              <SelectItem value="custom">+ Добавить свой...</SelectItem>
            </SelectContent>
          </Select>
          {newTag && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addTag(newTag)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (newTag.trim()) addTag(newTag);
              }
            }}
            placeholder="Свой тег..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={isSubmitting || !title.trim()}>
          {isSubmitting ? "Сохранение..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
