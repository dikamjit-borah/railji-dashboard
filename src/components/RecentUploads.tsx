import { FileText } from "lucide-react";

interface Upload {
  id: string;
  filename: string;
  uploadedBy: string;
  uploadedAt: string;
  examName: string;
  fileSize: string;
}

const uploads: Upload[] = [
  {
    id: "1",
    filename: "NTPC_Mathematics_2024.pdf",
    uploadedBy: "Gurjit Ching",
    uploadedAt: "2 hours ago",
    examName: "RRB NTPC - Mathematics",
    fileSize: "2.4 MB",
  },
  {
    id: "2",
    filename: "GroupD_General_Awareness.pdf",
    uploadedBy: "Pramod Debnath",
    uploadedAt: "1 day ago",
    examName: "RRB Group D",
    fileSize: "1.8 MB",
  },
  {
    id: "3",
    filename: "Technician_Reasoning.pdf",
    uploadedBy: "Amit Patel",
    uploadedAt: "3 days ago",
    examName: "Railways Technician",
    fileSize: "3.1 MB",
  },
];

export function RecentUploads() {
  return (
    <div className="bg-white border border-slate-200">
      <div className="px-6 py-6 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-950">Recent Uploads</h2>
        <p className="text-sm text-slate-600 mt-1">
          Latest papers added to the system
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="table-minimal">
          <thead>
            <tr>
              <th>Filename</th>
              <th>Exam</th>
              <th>Uploaded By</th>
              <th>When</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            {uploads.map((upload) => (
              <tr key={upload.id}>
                <td className="font-medium text-slate-950">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    {upload.filename}
                  </div>
                </td>
                <td>{upload.examName}</td>
                <td>{upload.uploadedBy}</td>
                <td className="text-slate-600">{upload.uploadedAt}</td>
                <td className="text-slate-600 text-right">{upload.fileSize}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-slate-100">
        <a
          href="/upload"
          className="text-sm font-medium text-slate-700 hover:text-slate-950 inline-flex items-center gap-2 transition-colors"
        >
          Upload new paper
          <span className="text-slate-400">→</span>
        </a>
      </div>
    </div>
  );
}
