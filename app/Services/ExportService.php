<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Member;
use App\Models\Membership;
use App\Models\StudioBooking;
use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Models\TrainingParticipantPayment;
use App\Services\Reports\FinancialReportService;
use App\Services\Reports\GymActivityReportService;
use App\Services\Reports\MembershipReportService;
use Illuminate\Support\Carbon;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportService
{
    public function __construct(
        private readonly GymActivityReportService $gymActivityReportService,
        private readonly MembershipReportService $membershipReportService,
        private readonly FinancialReportService $financialReportService,
        private readonly SettingsService $settingsService,
    ) {}

    public function exportMembers(): StreamedResponse
    {
        $members = Member::withTrashed()
            ->withCount(['activeMemberships'])
            ->orderBy('created_at')
            ->get();

        return $this->stream('daftar-member', 'Daftar Member', function (Writer $writer) use ($members) {
            $writer->addRow(Row::fromValues([
                'Nama', 'Nomor Telepon', 'Gender', 'Tanggal Lahir', 'Alamat',
                'Total Membership Aktif', 'Status', 'Dibuat Pada',
            ]));

            foreach ($members as $member) {
                $writer->addRow(Row::fromValues([
                    $member->name,
                    $member->phone,
                    $member->gender === 'male' ? 'Laki-laki' : ($member->gender === 'female' ? 'Perempuan' : '-'),
                    $member->birth_date?->format('d-m-Y') ?? '-',
                    $member->address ?? '-',
                    (string) $member->active_memberships_count,
                    $member->deleted_at ? 'Dihapus' : ($member->is_active ? 'Aktif' : 'Nonaktif'),
                    $member->created_at->format('d-m-Y H:i'),
                ]));
            }
        });
    }

    public function exportMemberships(): StreamedResponse
    {
        $memberships = Membership::withTrashed()
            ->with(['member', 'details.gymClass'])
            ->orderBy('created_at')
            ->get();

        return $this->stream('data-membership', 'Data Membership', function (Writer $writer) use ($memberships) {
            $writer->addRow(Row::fromValues([
                'Nama Member', 'Nomor Telepon', 'Paket', 'Harga', 'Status',
                'Tanggal Mulai', 'Tanggal Berakhir', 'Detail Kuota', 'Dibuat Pada',
            ]));

            foreach ($memberships as $membership) {
                $quotaDetail = $membership->details->map(function ($detail) {
                    $quota = $detail->is_unlimited ? 'Unlimited' : "{$detail->quota_used}/{$detail->quota}";

                    return "{$detail->class_name}: {$quota}";
                })->implode(', ');

                $writer->addRow(Row::fromValues([
                    $membership->member?->name ?? '-',
                    $membership->member?->phone ?? '-',
                    $membership->package_name,
                    (string) $membership->price,
                    ucfirst($membership->status),
                    $membership->start_date?->format('d-m-Y') ?? '-',
                    $membership->end_date?->format('d-m-Y') ?? 'Manual',
                    $quotaDetail,
                    $membership->created_at->format('d-m-Y H:i'),
                ]));
            }
        });
    }

    public function exportBookings(): StreamedResponse
    {
        $bookings = StudioBooking::withTrashed()
            ->with('paymentConfiguration')
            ->orderByDesc('booking_date')
            ->orderByDesc('start_time')
            ->get();

        $statusLabels = [
            'upcoming' => 'Akan Datang',
            'ongoing' => 'Berlangsung',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
        ];

        return $this->stream('booking-sanggar', 'Laporan Booking Sanggar', function (Writer $writer) use ($bookings, $statusLabels) {
            $writer->addRow(Row::fromValues([
                'Nama Pelanggan', 'Nomor Telepon', 'Tanggal Booking', 'Jam Mulai', 'Jam Selesai',
                'Durasi (menit)', 'Harga', 'Status Pembayaran', 'Metode Pembayaran', 'No. Invoice',
                'Status Booking', 'Catatan', 'Dibuat Pada',
            ]));

            foreach ($bookings as $booking) {
                $writer->addRow(Row::fromValues([
                    $booking->customer_name,
                    $booking->customer_phone,
                    $booking->booking_date->format('d-m-Y'),
                    substr((string) $booking->start_time, 0, 5),
                    substr((string) $booking->end_time, 0, 5),
                    (string) $booking->duration_minutes,
                    (string) $booking->price,
                    $booking->payment_status === 'paid' ? 'Lunas' : 'Belum Bayar',
                    $booking->payment_method ? ucfirst($booking->payment_method) : '-',
                    $booking->invoice_number ?? '-',
                    $statusLabels[$booking->status] ?? $booking->status,
                    $booking->notes ?? '-',
                    $booking->created_at->format('d-m-Y H:i'),
                ]));
            }
        });
    }

    public function exportGymActivityReport(array $filters): StreamedResponse
    {
        $rows = $this->gymActivityReportService->exportRows($filters);
        $filename = 'Gym_Report_'.Carbon::today()->format('Y-m-d');

        return $this->stream($filename, 'Laporan Gym Activity', function (Writer $writer) use ($rows) {
            $writer->addRow(Row::fromValues([
                'Nama Pelanggan', 'Status Member', 'Kelas Senam', 'Tanggal Transaksi', 'Jam Transaksi',
                'Metode Pembayaran', 'No. Invoice', 'Jumlah',
            ]));

            foreach ($rows as $row) {
                $writer->addRow(Row::fromValues([
                    $row->customer_name,
                    $row->member_status === 'member' ? 'Member' : 'Non Member',
                    $row->gym_class ?? '-',
                    $row->transaction_date,
                    substr((string) $row->transaction_time, 0, 5),
                    $row->payment_method ? ucfirst($row->payment_method) : '-',
                    $row->invoice_number ?? '-',
                    (string) $row->amount,
                ]));
            }
        });
    }

    public function exportMembershipReport(array $filters): StreamedResponse
    {
        $rows = $this->membershipReportService->exportRows($filters);
        $filename = 'Membership_Report_'.Carbon::today()->format('Y-m-d');

        $statusLabels = ['active' => 'Aktif', 'expired' => 'Expired', 'cancelled' => 'Dibatalkan'];

        return $this->stream($filename, 'Laporan Membership', function (Writer $writer) use ($rows, $statusLabels) {
            $writer->addRow(Row::fromValues([
                'Nama Member', 'Nomor Telepon', 'Paket', 'Tanggal Beli', 'Tanggal Berakhir',
                'Status', 'Sisa Kuota', 'Unlimited', 'Check-In Terakhir',
            ]));

            foreach ($rows as $row) {
                $writer->addRow(Row::fromValues([
                    $row['member_name'],
                    $row['member_phone'],
                    $row['package_name'],
                    $row['purchase_date'] ?? '-',
                    $row['expired_date'] ?? 'Manual',
                    $statusLabels[$row['current_status']] ?? $row['current_status'],
                    $row['is_unlimited'] ? 'Unlimited' : ($row['remaining_quota'] ?? 0),
                    $row['is_unlimited'] ? 'Ya' : 'Tidak',
                    $row['last_checkin_at'] ?? 'Belum Pernah',
                ]));
            }
        });
    }

    public function exportTrainings(): StreamedResponse
    {
        $trainings = Training::withTrashed()
            ->withCount([
                'participants as participants_count' => fn ($q) => $q->whereNull('deleted_at'),
            ])
            ->orderBy('title')
            ->get();

        $statusLabels = [
            'upcoming' => 'Akan Datang',
            'ongoing' => 'Berjalan',
            'completed' => 'Selesai',
        ];

        return $this->stream('master-pelatihan', 'Master Data Pelatihan', function (Writer $writer) use ($trainings, $statusLabels) {
            $writer->addRow(Row::fromValues([
                'Judul', 'Trainer', 'Tanggal', 'Lokasi', 'Harga', 'Jumlah Peserta', 'Status', 'Dibuat Pada',
            ]));

            foreach ($trainings as $training) {
                $dates = collect($training->training_dates ?? [])->implode(', ');
                $writer->addRow(Row::fromValues([
                    $training->title,
                    $training->trainer_name,
                    $dates,
                    $training->training_location ?? '-',
                    (string) $training->price,
                    (string) $training->participants_count,
                    $statusLabels[$training->computeNaturalStatus()] ?? $training->computeNaturalStatus(),
                    $training->created_at->format('d-m-Y H:i'),
                ]));
            }
        });
    }

    public function exportTrainingParticipants(): StreamedResponse
    {
        $participants = TrainingParticipant::withTrashed()
            ->with('training:id,title')
            ->orderByDesc('created_at')
            ->get();

        $statusLabels = [
            'paid' => 'Lunas',
            'unpaid' => 'Belum Bayar',
            'pay_later' => 'Bayar Nanti',
        ];

        return $this->stream('peserta-pelatihan', 'Daftar Peserta Pelatihan', function (Writer $writer) use ($participants, $statusLabels) {
            $writer->addRow(Row::fromValues([
                'Nama', 'Nomor HP', 'Pelatihan', 'Tanggal Diikuti', 'Invoice', 'Harga', 'Status Pembayaran', 'Metode', 'Dibuat Pada',
            ]));

            foreach ($participants as $participant) {
                $selectedDates = $participant->selected_training_dates ?? [];
                sort($selectedDates);

                $writer->addRow(Row::fromValues([
                    $participant->full_name,
                    $participant->phone,
                    $participant->training?->title ?? '-',
                    $selectedDates !== [] ? implode(', ', $selectedDates) : '-',
                    $participant->invoice_number ?? '-',
                    (string) $participant->amount,
                    $statusLabels[$participant->payment_status] ?? $participant->payment_status,
                    $participant->payment_method ?? '-',
                    $participant->created_at->format('d-m-Y H:i'),
                ]));
            }
        });
    }

    public function exportTrainingPayments(): StreamedResponse
    {
        $payments = TrainingParticipantPayment::query()
            ->with(['participant.training', 'recorder:id,name'])
            ->orderByDesc('paid_at')
            ->get();

        return $this->stream('pembayaran-pelatihan', 'Riwayat Pembayaran Pelatihan', function (Writer $writer) use ($payments) {
            $writer->addRow(Row::fromValues([
                'Invoice', 'Nama Peserta', 'Pelatihan', 'Jumlah', 'Metode', 'Dicatat Oleh', 'Tanggal Bayar',
            ]));

            foreach ($payments as $payment) {
                $writer->addRow(Row::fromValues([
                    $payment->invoice_number,
                    $payment->participant?->full_name ?? '-',
                    $payment->participant?->training?->title ?? '-',
                    (string) $payment->amount,
                    ucfirst($payment->payment_method),
                    $payment->recorder?->name ?? '-',
                    $payment->paid_at->format('d-m-Y H:i'),
                ]));
            }
        });
    }

    public function exportFinancialReport(array $filters): StreamedResponse
    {
        $rows = $this->financialReportService->exportRows($filters);
        $filename = 'Financial_Report_'.Carbon::today()->format('Y-m-d');

        return $this->stream($filename, 'Laporan Keuangan', function (Writer $writer) use ($rows) {
            $writer->addRow(Row::fromValues([
                'Tanggal Transaksi', 'No. Invoice', 'Kategori', 'Pelanggan',
                'Metode Pembayaran', 'Jumlah', 'Status',
            ]));

            foreach ($rows as $row) {
                $writer->addRow(Row::fromValues([
                    $row['transaction_date'],
                    $row['invoice_number'],
                    $row['category_label'],
                    $row['customer_name'],
                    $row['payment_method'] ? ucfirst($row['payment_method']) : '-',
                    (string) $row['amount'],
                    $row['status'],
                ]));
            }
        });
    }

    private function stream(string $filename, string $reportTitle, callable $callback): StreamedResponse
    {
        $response = new StreamedResponse(function () use ($callback, $filename, $reportTitle) {
            $writer = new Writer;
            $writer->openToBrowser($filename.'.xlsx');
            $this->writeMetadata($writer, $reportTitle);
            $callback($writer);
            $writer->close();
        });

        $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->headers->set('Content-Disposition', "attachment; filename=\"{$filename}.xlsx\"");

        return $response;
    }

    private function writeMetadata(Writer $writer, string $reportTitle): void
    {
        $appName = (string) $this->settingsService->get('app_name', config('app.name'));
        $exportedAt = now()->format('d/m/Y H:i');
        $exportedBy = auth()->user()?->name ?? 'Sistem';

        $writer->addRow(Row::fromValues([$appName]));
        $writer->addRow(Row::fromValues([$reportTitle]));
        $writer->addRow(Row::fromValues(["Tanggal Ekspor: {$exportedAt}"]));
        $writer->addRow(Row::fromValues(["Diekspor Oleh: {$exportedBy}"]));
        $writer->addRow(Row::fromValues([]));
    }
}
