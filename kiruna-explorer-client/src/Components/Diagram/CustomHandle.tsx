import { Handle, HandleProps } from '@xyflow/react';

function CustomHandle(props: HandleProps) {
    return (
        <Handle
            className="w-2.5 h-2.5 bg-[#cccccc] dark:bg-[#8B8B8B] rounded-full border-none"
            {...props}
        />
    );
}

export default CustomHandle;