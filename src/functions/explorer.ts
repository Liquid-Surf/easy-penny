// These functions are useful for putting Penny in "integrate" mode,
// i.e. preinstalled on a Pod as its native interface.

export function getFileTypeIcon(filename: string): string {
  	if (filename.slice(-1) == '/'){
    	return '📁'
  	}
    const fileExtension = filename.split('.').pop();
    switch (fileExtension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return '🖼️';
        case 'mp4':
        case 'mkv':
        case 'avi':
            return '🎥';
        case 'txt':
        case 'pdf':
        case 'doc':
        case 'docx':
        case 'odt':
            return '📄';
        case 'xls':
        case 'xlsx':
        case 'ods':
            return '📊';
        case 'ppt':
        case 'pptx':
        case 'odp':
            return '📈';
        case 'zip':
        case 'rar':
        case '7z':
            return '🗜️';
        default:
            return '';
    }
}

