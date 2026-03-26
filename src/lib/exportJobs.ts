type JobStatus = {
  id: string;
  progress: number;
  status: 'processing' | 'completed' | 'error';
  url?: string;
  error?: string;
};

// Singleton to persist jobs during development hot-reloads
const globalForJobs = global as unknown as { exportJobsMap: Map<string, JobStatus> };
const jobs = globalForJobs.exportJobsMap || new Map<string, JobStatus>();
if (process.env.NODE_ENV !== 'production') globalForJobs.exportJobsMap = jobs;

export const exportJobManager = {
  set: (id: string, job: JobStatus) => jobs.set(id, job),
  get: (id: string) => jobs.get(id),
  update: (id: string, partial: Partial<JobStatus>) => {
    const job = jobs.get(id);
    if (job) {
      jobs.set(id, { ...job, ...partial });
    }
  },
  delete: (id: string) => jobs.delete(id)
};
