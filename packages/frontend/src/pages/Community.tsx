import { useState } from "react";
import { Users } from "lucide-react";
import GroupsList from "@/components/GroupsList";

const Community = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex">
      <GroupsList
        onGroupSelect={setSelectedGroupId}
        selectedGroupId={selectedGroupId}
      />

      {/* Main content - placeholder for now */}
      <div className="flex-1 p-6">
        {selectedGroupId ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold">Group Content</h2>
            <p className="text-muted-foreground">Selected group: {selectedGroupId}</p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Group</h3>
              <p className="text-muted-foreground">Choose a group from the list to view its matches</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
