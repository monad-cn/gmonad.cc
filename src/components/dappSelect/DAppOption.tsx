import { Tooltip } from 'antd';
import {Dapp} from "@/pages/api/dapp";

interface DAppOptionProps {
  dapp: Dapp;
}

export function DAppOption({ dapp }: DAppOptionProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      parent.innerHTML = '<div style="width: 20px; height: 20px; background: #ddd; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999;">?</div>';
    }
  };

  return (
    <Tooltip
      title={
        <div style={{ maxWidth: '300px' }}>
          <div style={{
            fontWeight: 'bold',
            marginBottom: '8px',
            fontSize: '14px'
          }}>
            {dapp.name}
          </div>
          {dapp.description && (
            <div style={{
              lineHeight: '1.4',
              fontSize: '13px'
            }}>
              {dapp.description}
            </div>
          )}
          {dapp.site && (
            <div style={{
              marginTop: '8px',
              fontSize: '12px'
            }}>
              <span style={{ color: '#ccc' }}>🌐 </span>
              <a
                href={dapp.site.startsWith('http') ? dapp.site : `https://${dapp.site}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#1890ff',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
              >
                {dapp.site}
              </a>
            </div>
          )}
        </div>
      }
      placement="right"
      mouseEnterDelay={0.5}
      mouseLeaveDelay={0.1}
      overlayStyle={{ maxWidth: '350px' }}
      trigger={['hover']}
      overlayInnerStyle={{
        padding: '12px',
        borderRadius: '8px'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '4px 0',
        width: '100%'
      }}>
        {/* DApp Logo */}
        <div style={{
          width: '32px',
          height: '32px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          overflow: 'hidden',
          backgroundColor: '#f5f5f5'
        }}>
          {dapp.logo ? (
            <img
              src={dapp.logo}
              alt={dapp.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={handleImageError}
            />
          ) : (
            <div style={{
              width: '20px',
              height: '20px',
              background: '#ddd',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#999'
            }}>
              ?
            </div>
          )}
        </div>

        {/* DApp Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#333',
            marginBottom: '2px'
          }}>
            {dapp.name}
          </div>
          {dapp.description && (
            <div style={{
              fontSize: '12px',
              color: '#666',
              lineHeight: '1.3',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {dapp.description.length > 30
                ? `${dapp.description.substring(0, 30)}...`
                : dapp.description}
            </div>
          )}
        </div>
      </div>
    </Tooltip>
  );
}
