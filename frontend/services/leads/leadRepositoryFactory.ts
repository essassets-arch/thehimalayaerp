import { BackendLeadReadRepository } from './backendLeadReadRepository';
import { BackendLeadWriteRepository } from './backendLeadWriteRepository';

let readRepositoryInstance: BackendLeadReadRepository | null = null;
let writeRepositoryInstance: BackendLeadWriteRepository | null = null;

export const LeadRepositoryFactory = {
  getReadRepository: () => {
    if (!readRepositoryInstance) {
      readRepositoryInstance = new BackendLeadReadRepository();
    }
    return readRepositoryInstance;
  },
  getWriteRepository: () => {
    if (!writeRepositoryInstance) {
      writeRepositoryInstance = new BackendLeadWriteRepository();
    }
    return writeRepositoryInstance;
  }
};
