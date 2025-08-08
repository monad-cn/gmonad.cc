'use client';
import React, { useEffect, useState } from 'react';
import { uploadImgToCloud } from '@/lib/cloudinary';

import styles from './VditorEditor.module.css';
import 'vditor/dist/index.css';

interface VditorEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  height?: number;
  width?: number;
  mode?: 'wysiwyg' | 'ir' | 'sv';
  placeholder?: string;
  lang?: 'en_US' | 'zh_CN';
  disabled?: boolean;
  onFocus?: (value: string) => void;
  onBlur?: (value: string) => void;
}

const VditorEditor = React.forwardRef<any, VditorEditorProps>(
  (
    {
      value = '',
      onChange,
      height = 400,
      width,
      mode = 'wysiwyg',
      placeholder = '请输入内容...',
      disabled = false,
      onFocus,
      onBlur,
    },
    ref
  ) => {
    const [vd, setVd] = useState<any>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      // 确保只在客户端环境下初始化
      if (typeof window === 'undefined' || !mounted) return;

      const initVditor = async () => {
        try {
          // 动态导入 Vditor 及其依赖
          const { default: Vditor } = await import('vditor');

          const vditor = new Vditor('vditor', {
            height,
            width,
            mode,
            placeholder,
            lang: 'zh_CN',
            cache: {
              enable: false, // 禁用缓存避免冲突
            },
            hint: {
              emoji: {
                'smiley': '😃',
                'smile': '😄',
                'grinning': '😀',
                'blush': '😊',
                'wink': '😉',
                'heart_eyes': '😍',
                'kissing_heart': '😘',
                'kissing_closed_eyes': '😚',
                'flushed': '😳',
                'relieved': '😌',
                'satisfied': '😆',
                'grin': '😁',
                'winking_eye': '😜',
                'stuck_out_tongue_winking_eye': '😜',
                'stuck_out_tongue_closed_eyes': '😝',
                'disappointed': '😞',
                'worried': '😟',
                'angry': '😠',
                'rage': '😡',
                'cry': '😢',
                'persevere': '😣',
                'triumph': '😤',
                'disappointed_relieved': '😥',
                'frowning': '😦',
                'anguished': '😧',
                'fearful': '😨',
                'weary': '😩',
                'sleepy': '😪',
                'tired_face': '😫',
                'grimacing': '😬',
                'sob': '😭',
                'open_mouth': '😮',
                'hushed': '😯',
                'cold_sweat': '😰',
                'scream': '😱',
                'astonished': '😲',
                'sleeping': '😴',
                'dizzy_face': '😵',
                'no_mouth': '😶',
                'mask': '😷',
                'smile_cat': '😸',
                'joy_cat': '😹',
                'smiley_cat': '😺',
                'heart_eyes_cat': '😻',
                'smirk_cat': '😼',
                'kissing_cat': '😽',
                'pouting_cat': '😾',
                'crying_cat_face': '😿',
                'scream_cat': '🙀',
                'slightly_frowning_face': '🙁',
                'slightly_smiling_face': '🙂',
                'upside_down_face': '🙃',
                'roll_eyes': '🙄',
                'see_no_evil': '🙈',
                'hear_no_evil': '🙉',
                'speak_no_evil': '🙊',
                'zipper_mouth_face': '🤐',
                'money_mouth_face': '🤑',
                'face_with_thermometer': '🤒',
                'nerd_face': '🤓',
                'thinking_face': '🤔',
                'face_with_head_bandage': '🤕',
                'robot_face': '🤖',
                'hugging_face': '🤗',
                'metal': '🤘',
                'call_me_hand': '🤙',
                'raised_back_of_hand': '🤚',
                'raised_hand_with_fingers_splayed': '🖐',
                'vulcan_salute': '🖖',
                'writing_hand': '✍',
                'nail_care': '💅',
                'lips': '👄',
                'tongue': '👅',
                'ear': '👂',
                'nose': '👃',
                'eye': '👁',
                'eyes': '👀',
                'bust_in_silhouette': '👤',
                'busts_in_silhouette': '👥',
                'speaking_head': '🗣',
                'baby': '👶',
                'boy': '👦',
                'girl': '👧',
                'man': '👨',
                'woman': '👩',
                'person_with_blond_hair': '👱',
                'older_man': '👴',
                'older_woman': '👵',
                'man_with_gua_pi_mao': '👲',
                'man_with_turban': '👳',
                'cop': '👮',
                'construction_worker': '👷',
                'guardsman': '💂',
                'spy': '🕵',
                'santa': '🎅',
                'angel': '👼',
                'princess': '👸',
                'bride_with_veil': '👰',
                'walking': '🚶',
                'runner': '🏃',
                'dancer': '💃',
                'dancers': '👯',
                'couple': '👫',
                'two_men_holding_hands': '👬',
                'two_women_holding_hands': '👭',
                'bow': '🙇',
                'information_desk_person': '💁',
                'no_good': '🙅',
                'ok_woman': '🙆',
                'raising_hand': '🙋',
                'person_with_pouting_face': '🙎',
                'person_frowning': '🙍',
                'haircut': '💇',
                'massage': '💆',
                'couple_with_heart': '💑',
                'woman-kiss-man': '👩‍❤️‍💋‍👨',
                'family': '👪',
                'muscle': '💪',
                'selfie': '🤳',
                'point_left': '👈',
                'point_right': '👉',
                'point_up': '☝',
                'point_up_2': '👆',
                'middle_finger': '🖕',
                'point_down': '👇',
                'victory_hand': '✌',
                'crossed_fingers': '🤞',
                'sign_of_the_horns': '🤘',
                'ok_hand': '👌',
                'thumbsup': '👍',
                'thumbsdown': '👎',
                'fist': '✊',
                'facepunch': '👊',
                'fist_left': '🤛',
                'fist_right': '🤜',
                'raised_hands': '🙌',
                'open_hands': '👐',
                'handshake': '🤝',
                'pray': '🙏',
                'heart': '❤️',
                'yellow_heart': '💛',
                'green_heart': '💚',
                'blue_heart': '💙',
                'purple_heart': '💜',
                'black_heart': '🖤',
                'broken_heart': '💔',
                'heavy_heart_exclamation': '❣',
                'two_hearts': '💕',
                'revolving_hearts': '💞',
                'heartbeat': '💓',
                'heartpulse': '💗',
                'sparkling_heart': '💖',
                'cupid': '💘',
                'gift_heart': '💝',
                'heart_decoration': '💟',
                'peace_symbol': '☮',
                'latin_cross': '✝',
                'star_and_crescent': '☪',
                'om': '🕉',
                'wheel_of_dharma': '☸',
                'star_of_david': '✡',
                'six_pointed_star': '🔯',
                'menorah': '🕎',
                'yin_yang': '☯',
                'orthodox_cross': '☦',
                'place_of_worship': '🛐',
                'ophiuchus': '⛎',
                'aries': '♈',
                'taurus': '♉',
                'gemini': '♊',
                'cancer': '♋',
                'leo': '♌',
                'virgo': '♍',
                'libra': '♎',
                'scorpius': '♏',
                'sagittarius': '♐',
                'capricorn': '♑',
                'aquarius': '♒',
                'pisces': '♓',
                'id': '🆔',
                'atom_symbol': '⚛',
                'accept': '🉑',
                'radioactive': '☢',
                'biohazard': '☣',
                'mobile_phone_off': '📴',
                'vibration_mode': '📳',
                'u6709': '🈶',
                'u7121': '🈚',
                'u7533': '🈸',
                'u55b6': '🈺',
                'u6708': '🈷️',
                'eight_pointed_black_star': '✴',
                'vs': '🆚',
                'white_flower': '💮',
                'ideograph_advantage': '🉐',
                'secret': '㊙',
                'congratulations': '㊗',
                'u5408': '🈴',
                'u6e80': '🈵',
                'u5272': '🈹',
                'u7981': '🈲',
                'a': '🅰',
                'b': '🅱',
                'ab': '🆎',
                'cl': '🆑',
                'o2': '🅾',
                'sos': '🆘',
                'x': '❌',
                'o': '⭕',
                'octagonal_sign': '🛑',
                'no_entry': '⛔',
                'name_badge': '📛',
                'no_entry_sign': '🚫',
                '100': '💯',
                'anger': '💢',
                'hotsprings': '♨',
                'no_pedestrians': '🚷',
                'do_not_litter': '🚯',
                'no_bicycles': '🚳',
                'non-potable_water': '🚱',
                'underage': '🔞',
                'no_mobile_phones': '📵',
                'no_smoking': '🚭',
                'exclamation': '❗',
                'grey_exclamation': '❕',
                'question': '❓',
                'grey_question': '❔',
                'bangbang': '‼',
                'interrobang': '⁉',
                'low_brightness': '🔅',
                'high_brightness': '🔆',
                'part_alternation_mark': '〽',
                'warning': '⚠',
                'children_crossing': '🚸',
                'trident': '🔱',
                'fleur_de_lis': '⚜',
                'beginner': '🔰',
                'recycle': '♻',
                'white_check_mark': '✅',
                'u6307': '🈯',
                'chart': '💹',
                'sparkle': '❇',
                'eight_spoked_asterisk': '✳',
                'negative_squared_cross_mark': '❎',
                'globe_with_meridians': '🌐',
                'diamond_shape_with_a_dot_inside': '💠',
                'm': 'Ⓜ',
                'cyclone': '🌀',
                'zzz': '💤',
                'atm': '🏧',
                'wc': '🚾',
                'wheelchair': '♿',
                'parking': '🅿',
                'u7a7a': '🈳',
                'sa': '🈂',
                'passport_control': '🛂',
                'customs': '🛃',
                'baggage_claim': '🛄',
                'left_luggage': '🛅',
                'fire': '🔥',
                'crescent_moon': '🌙',
                'star': '⭐',
                'star2': '🌟',
                'dizzy': '💫',
                'sparkles': '✨',
                'comet': '☄',
                'sunny': '☀️',
                'sun_with_face': '🌞',
                'full_moon': '🌝',
                'first_quarter_moon': '🌛',
                'last_quarter_moon': '🌜',
                'new_moon_with_face': '🌚',
                'full_moon_with_face': '🌝',
                'first_quarter_moon_with_face': '🌛',
                'last_quarter_moon_with_face': '🌜',
                'new_moon': '🌑',
                'waxing_crescent_moon': '🌒',
                'moon': '🌔',
                'waning_gibbous_moon': '🌖',
                'waning_crescent_moon': '🌘',
                'partly_sunny': '⛅',
                'cloud': '☁️',
                'zap': '⚡',
                'umbrella': '☔',
                'snowflake': '❄️',
                'snowman': '⛄',
                'foggy': '🌁',
                'ocean': '🌊',
                'cat': '🐱',
                'dog': '🐶',
                'mouse': '🐭',
                'hamster': '🐹',
                'rabbit': '🐰',
                'wolf': '🐺',
                'frog': '🐸',
                'tiger': '🐯',
                'koala': '🐨',
                'bear': '🐻',
                'pig': '🐷',
                'pig_nose': '🐽',
                'cow': '🐮',
                'boar': '🐗',
                'monkey_face': '🐵',
                'monkey': '🐒',
                'horse': '🐴',
                'racehorse': '🐎',
                'camel': '🐫',
                'sheep': '🐑',
                'elephant': '🐘',
                'panda_face': '🐼',
                'snake': '🐍',
                'bird': '🐦',
                'baby_chick': '🐤',
                'hatched_chick': '🐥',
                'hatching_chick': '🐣',
                'chicken': '🐔',
                'penguin': '🐧',
                'turtle': '🐢',
                'bug': '🐛',
                'honeybee': '🐝',
                'ant': '🐜',
                'beetle': '🐞',
                'snail': '🐌',
                'octopus': '🐙',
                'tropical_fish': '🐠',
                'fish': '🐟',
                'whale': '🐳',
                'whale2': '🐋',
                'dolphin': '🐬',
                'cow2': '🐄',
                'ram': '🐏',
                'rat': '🐀',
                'water_buffalo': '🐃',
                'tiger2': '🐅',
                'rabbit2': '🐇',
                'dragon': '🐉',
                'goat': '🐐',
                'rooster': '🐓',
                'dog2': '🐕',
                'pig2': '🐖',
                'mouse2': '🐁',
                'ox': '🐂',
                'dragon_face': '🐲',
                'blowfish': '🐡',
                'crocodile': '🐊',
                'dromedary_camel': '🐪',
                'leopard': '🐆',
                'cat2': '🐈',
                'poodle': '🐩',
              },
            },
            preview: {
              delay: 500,
              mode: 'both',
              maxWidth: 800,
              math: {
                engine: 'MathJax',
                inlineDigit: true,
                macros: {},
              },
            },
            toolbar: [
              'emoji',
              'headings',
              'bold',
              'italic',
              'strike',
              'link',
              '|',
              'list',
              'ordered-list',
              'check',
              'indent',
              'outdent',
              '|',
              'quote',
              'line',
              'code',
              'inline-code',
              '|',
              'upload',
              'table',
              '|',
              'undo',
              'redo',
              '|',
              'fullscreen',
              'edit-mode',
              {
                name: 'more',
                toolbar: [
                  'both',
                  'code-theme',
                  'content-theme',
                  'export',
                  'outline',
                  'preview',
                  'devtools',
                  'info',
                  'help',
                ],
              },
            ],
            counter: {
              enable: true,
              type: 'markdown',
            },
            resize: {
              enable: true,
              position: 'bottom',
            },
            upload: {
              accept: 'image/*',
              max: 5 * 1024 * 1024, // 5MB
              handler: async (files: File[]) => {
                console.log('开始上传图片，文件数量', files.length);

                try {
                  const uploadPromises = files.map(async (file, index) => {
                    console.log(
                      `上传第${index + 1}个文件:`,
                      file.name,
                      file.type,
                      file.size
                    );

                    // 验证文件类型
                    if (!file.type.startsWith('image/')) {
                      throw new Error('只能上传图片文件!');
                    }

                    // 验证文件大小 (5MB)
                    if (file.size / 1024 / 1024 > 5) {
                      throw new Error('图片大小不能超过 5MB!');
                    }

                    // 上传到 Cloudinary
                    console.log('正在上传到 Cloudinary...');
                    const result = await uploadImgToCloud(file);
                    console.log('Cloudinary上传结果', result);

                    if (result && result.secure_url) {
                      const imageUrl = result.secure_url;
                      console.log('图片上传成功，URL', imageUrl);
                      return imageUrl;
                    } else {
                      throw new Error('图片上传失败：未获取到URL');
                    }
                  });

                  const imageUrls = await Promise.all(uploadPromises);

                  // 手动插入图片到编辑器
                  imageUrls.forEach((url) => {
                    const markdown = `![image](${url})\n`;
                    vditor.insertValue(markdown);
                  });

                  console.log('所有图片已插入编辑器');
                  return null; // 返回null表示我们已手动处理
                } catch (error) {
                  const errorMsg = `图片上传失败: ${error instanceof Error ? error.message : '未知错误'}`;
                  console.error(errorMsg);
                  setError(errorMsg);
                  throw new Error(errorMsg);
                }
              },
            },
            after: () => {
              console.log('Vditor初始化完成');
              console.log(vditor);
              console.log(value);

              if (value) {
                vditor.setValue(value);
              }
              setVd(vditor);
              setIsLoading(false);

              if (disabled) {
                vditor.disabled();
              }
            },
            input: (val: string) => {
              if (onChange) {
                onChange(val);
              }
            },
            focus: (val: string) => {
              if (onFocus) {
                onFocus(val);
              }
            },
            blur: (val: string) => {
              if (onBlur) {
                onBlur(val);
              }
            },
          });
        } catch (error) {
          console.error('Vditor 初始化失败', error);
          setError('编辑器加载失败，请刷新页面重试');
          setIsLoading(false);
        }
      };

      initVditor();

      // Clear the effect
      return () => {
        vd?.destroy();
        setVd(undefined);
      };
    }, [mounted]);

    // 更新值
    useEffect(() => {
      if (vd && value !== vd.getValue()) {
        vd.setValue(value || '');
      }
    }, [value, vd]);

    // 更新禁用状态
    useEffect(() => {
      if (vd) {
        if (disabled) {
          vd.disabled();
        } else {
          vd.enable();
        }
      }
    }, [disabled, vd]);

    // 暴露实例方法给父组件
    React.useImperativeHandle(ref, () => ({
      getValue: () => vd?.getValue() || '',
      setValue: (val: string) => vd?.setValue(val),
      insertValue: (val: string) => vd?.insertValue(val),
      focus: () => vd?.focus(),
      blur: () => vd?.blur(),
      disabled: () => vd?.disabled(),
      enable: () => vd?.enable(),
      getHTML: () => vd?.getHTML() || '',
      destroy: () => vd?.destroy(),
    }));

    if (error) {
      return <div className={styles.error}>{error}</div>;
    }

    return (
      <div className={styles.container}>
        <div
          id="vditor"
          style={{ opacity: isLoading ? 0 : 1 }}
          className={`vditor ${styles.editor}`}
        />
        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.loadingContent}>
              正在加载 Markdown 编辑器...
            </div>
          </div>
        )}
      </div>
    );
  }
);

VditorEditor.displayName = 'VditorEditor';

export default VditorEditor;
