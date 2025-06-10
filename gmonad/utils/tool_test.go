package utils

import (
	"testing"
)

func TestGetGitRank(t *testing.T) {
	tests := []struct {
		name     string
		content  string
		expected string
		wantErr  bool
	}{
		{
			name: "Valid SVG with Rank A",
			content: `<svg
        width="450"
        height="195"
        viewBox="0 0 450 195"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="descId"
      >
        <title id="titleId">Anurag Hazra's GitHub Stats, Rank: B+</title>
        <desc id="descId">Total Stars Earned: 75647, Total Commits in 2025 : 76, Total PRs: 802, Total Issues: 180, Contributed to (last year): 3</desc>
        <style>
          /* Styles omitted for brevity */
        </style>
      </svg>`,
			expected: "B",
			wantErr:  false,
		},
		{
			name: "Invalid SVG without <title> tag",
			content: `<svg
        width="450"
        height="195"
        viewBox="0 0 450 195"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="descId"
      >
        <desc id="descId">Total Stars Earned: 75647, Total Commits in 2025 : 76, Total PRs: 802, Total Issues: 180, Contributed to (last year): 3</desc>
        <style>
          /* Styles omitted for brevity */
        </style>
      </svg>`,
			expected: "",
			wantErr:  true,
		},
		{
			name: "Valid SVG with missing Rank",
			content: `<svg
        width="450"
        height="195"
        viewBox="0 0 450 195"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="descId"
      >
        <title id="titleId">Anurag Hazra's GitHub Stats</title>
        <desc id="descId">Total Stars Earned: 75647, Total Commits in 2025 : 76, Total PRs: 802, Total Issues: 180, Contributed to (last year): 3</desc>
        <style>
          /* Styles omitted for brevity */
        </style>
      </svg>`,
			expected: "",
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := GetGitRank(tt.content)
			if (err != nil) != tt.wantErr {
				t.Errorf("GetGitRank() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.expected {
				t.Errorf("GetGitRank() = %v, want %v", got, tt.expected)
			}
		})
	}
}
