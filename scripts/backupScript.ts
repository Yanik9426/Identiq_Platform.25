import { logAuditEvent } from '../src/services/auditService'; // Adjust path as needed
import { performBackup } from './backupLogic'; // Your actual backup function

async function runBackup() {
    const backupId = `backup-${Date.now()}`;
    console.log('Starting database backup...');
    await logAuditEvent('system', 'data_backup_started', { type: 'system', id: 'databaseBackup' }, { backupId });

    try {
        const result = await performBackup(); // Your function that does the work
        console.log('Backup completed successfully.');
        await logAuditEvent('system', 'data_backup_completed', { type: 'system', id: 'databaseBackup' }, { backupId, status: 'success', details: result });
    } catch (error) {
        console.error('Backup failed:', error);

        let errorMessage = 'An unknown error occurred during backup.';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        await logAuditEvent('system', 'data_backup_completed', { type: 'system', id: 'databaseBackup' }, { backupId, status: 'failure', error: errorMessage });
    }
}

runBackup(); // Execute the script
