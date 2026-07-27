using System;

namespace LawFirm.Infrastructure.Storage;

public interface IBlobStorageService
{
    Task<string> UploadFileAsync(string containerName, string blobPath, Stream fileStream, string contentType);
    Task<Stream> DownloadFileAsync(string containerName, string blobPath);
    Task DeleteFileASync(string containerName, string blobPath);

}
