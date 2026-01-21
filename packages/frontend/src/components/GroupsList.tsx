import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Group {
  id: string;
  name: string;
  description: string | null;
  group_type: 'General' | 'Ranked';
  ranking_level: string | null;
  created_at: string;
}

interface GroupsListProps {
  onGroupSelect: (groupId: string) => void;
  selectedGroupId: string | null;
}

const GroupsList = ({ onGroupSelect, selectedGroupId }: GroupsListProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('groups')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Sort groups: General first, then Ranked by ranking level
        const sortedGroups = (data || []).sort((a: Group, b: Group) => {
          // General groups come first
          if (a.group_type === 'General' && b.group_type !== 'General') return -1;
          if (a.group_type !== 'General' && b.group_type === 'General') return 1;

          // Both are ranked groups, sort by ranking level
          if (a.group_type === 'Ranked' && b.group_type === 'Ranked') {
            const getFirstNum = (level: string | null) => {
              if (!level) return 0;
              const match = level.match(/\d+/);
              return match ? parseInt(match[0]) : 0;
            };
            return getFirstNum(a.ranking_level) - getFirstNum(b.ranking_level);
          }

          return 0;
        });

        setGroups(sortedGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="w-[480px] p-4">
        <Card className="bg-card/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-[480px] p-6">
      <Card className="bg-card/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-6 w-6" />
            Groups
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => onGroupSelect(group.id)}
              className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                selectedGroupId === group.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {group.group_type === 'General' ? (
                      <Users className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <Trophy className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                    <h3 className="font-semibold text-base truncate">{group.name}</h3>
                  </div>
                  {group.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {group.description}
                    </p>
                  )}
                </div>
                {group.ranking_level && (
                  <Badge variant="secondary" className="capitalize text-sm flex-shrink-0">
                    {group.ranking_level}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupsList;
